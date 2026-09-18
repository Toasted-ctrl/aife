import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { AppHeader } from "../components/app-header"
import { ChatModelSelector } from "../components/chat-model-selector"
import { getProviderModels, type ProvidersOffering } from "../services/get-models"
import { getProviderConfiguration, type ProviderConfiguration } from "../services/get-provider-configuration"
import { getUser, type User } from "../services/get-user"
import { streamAgent } from "../services/stream-agent"

type Message = {
    role: "user" | "assistant"
    content: string
}

export function ChatPage() {
    const navigate = useNavigate()
    const [user, setUser] = useState<User | null>(null)
    const [offerings, setOfferings] = useState<ProvidersOffering | null>(null)
    const [providerConfigs, setProviderConfigs] = useState<ProviderConfiguration[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [provider, setProvider] = useState("")
    const [model, setModel] = useState("")
    const [threadId, setThreadId] = useState<string | null>(null)
    const bottomRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const abortRef = useRef<AbortController | null>(null)

    useEffect(() => {
        getUser()
            .then(setUser)
            .catch(() => navigate("/login", { replace: true }))
    }, [navigate])

    useEffect(() => {
        getProviderModels().then(setOfferings).catch(console.error)
        getProviderConfiguration().then((res) => setProviderConfigs(res.providers)).catch(console.error)
    }, [])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    function autoResize() {
        const el = textareaRef.current
        if (!el) return
        el.style.height = "auto"
        el.style.height = Math.min(el.scrollHeight, 200) + "px"
    }

    async function handleSend() {
        const text = input.trim()
        if (!text || loading || !provider || !model) return

        const userMessage: Message = { role: "user", content: text }
        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setLoading(true)

        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
        }

        setMessages((prev) => [...prev, { role: "assistant", content: "" }])

        const controller = new AbortController()
        abortRef.current = controller

        try {
            await streamAgent(
                {
                    threadId,
                    provider,
                    model,
                    prompt: text,
                },
                {
                    onChunk: (chunk) => {
                        setMessages((prev) => {
                            const updated = [...prev]
                            const last = updated[updated.length - 1]
                            updated[updated.length - 1] = {
                                ...last,
                                content: last.content + chunk,
                            }
                            return updated
                        })
                    },
                    onThreadId: (id) => setThreadId(id),
                },
                controller.signal,
            )
        } catch (err) {
            if ((err as Error).name !== "AbortError") {
                setMessages((prev) => {
                    const updated = [...prev]
                    const last = updated[updated.length - 1]
                    if (!last.content) {
                        updated[updated.length - 1] = {
                            ...last,
                            content: `Error: ${(err as Error).message}`,
                        }
                    }
                    return updated
                })
            }
        } finally {
            abortRef.current = null
            setLoading(false)
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex h-svh flex-col bg-zinc-950">
            <AppHeader
                showNewChat={messages.length > 0}
                onNewChat={() => {
                    if (loading) abortRef.current?.abort()
                    setMessages([])
                    setThreadId(null)
                    setLoading(false)
                }}
            />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
                {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2">
                        <p className="text-3xl font-semibold text-zinc-200">
                            {user ? `Hi ${user.first_name}!` : ""}
                        </p>
                        <p className="text-sm text-zinc-500">
                            Select a model or agent below to start chatting.
                        </p>
                    </div>
                ) : (
                    <div className="mx-auto max-w-2xl px-4 py-6">
                        {messages.map((msg, i) => (
                            msg.role === "user" ? (
                            <div key={i} className="mb-6 flex justify-end">
                                <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-zinc-700 px-4 py-2.5 text-sm leading-relaxed text-zinc-100 whitespace-pre-wrap">
                                    {msg.content}
                                </div>
                            </div>
                            ) : (
                            <div key={i} className="mb-6 flex gap-3">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-xs font-medium text-indigo-400">
                                    A
                                </div>
                                <div className="prose prose-invert prose-sm min-w-0 max-w-none pt-0.5 leading-relaxed text-zinc-300">
                                    <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
                                </div>
                            </div>
                            )
                        ))}
                        {loading && (
                            <div className="mb-6 flex gap-3">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-xs font-medium text-indigo-400">
                                    A
                                </div>
                                <div className="flex items-center gap-1 pt-1">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500" />
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500 [animation-delay:150ms]" />
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500 [animation-delay:300ms]" />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-zinc-800 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <div className="mx-auto max-w-2xl">
                    {offerings ? (
                        <ChatModelSelector
                            offerings={offerings}
                            providerConfigs={providerConfigs}
                            selectedProvider={provider}
                            selectedModel={model}
                            onSelect={(p, m) => { setProvider(p); setModel(m) }}
                        />
                    ) : (
                        <div className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-zinc-500">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-600" />
                            Loading models...
                        </div>
                    )}
                    <div className="mt-2 flex items-end gap-2">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value)
                            autoResize()
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Send a message..."
                        rows={1}
                        className="flex-1 resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading || !model}
                        className="flex h-[48px] w-[48px] shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white text-zinc-900 transition-all hover:bg-zinc-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
