import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppHeader } from "../components/app-header"
import { ChatInput } from "../components/chat-input"
import { ChatWindow, type Message, type ContentBlock } from "../components/chat-window"
import { getProviderModels, type ProvidersOffering } from "../services/get-models"
import { getProviderConfiguration, type ProviderConfiguration } from "../services/get-provider-configuration"
import { getMcps, type Mcp } from "../services/get-mcps"
import { getUser, type User } from "../services/get-user"
import { streamAgent } from "../services/stream-agent"

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
    const [mcps, setMcps] = useState<Mcp[]>([])
    const [selectedMcps, setSelectedMcps] = useState<string[]>([])
    const [userVsFiles, setUserVsFiles] = useState(false)
    const [userVsMemories, setUserVsMemories] = useState(false)
    const [threadId, setThreadId] = useState<string | null>(null)
    const abortRef = useRef<AbortController | null>(null)

    useEffect(() => {
        getUser()
            .then(setUser)
            .catch(() => navigate("/login", { replace: true }))
    }, [navigate])

    useEffect(() => {
        getProviderModels().then(setOfferings).catch(console.error)
        getProviderConfiguration().then((res) => setProviderConfigs(res.providers)).catch(console.error)
        getMcps().then((res) => setMcps(res.mcps)).catch(console.error)
    }, [])

    async function handleSend() {
        const text = input.trim()
        if (!text || loading || !provider || !model) return

        const userMessage: Message = { role: "user", content: text }
        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setLoading(true)

        setMessages((prev) => [...prev, { role: "assistant", content: "", blocks: [{ type: "text", text: "" }] }])

        const controller = new AbortController()
        abortRef.current = controller

        function appendBlock(block: ContentBlock) {
            setMessages((prev) => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                const blocks = [...(last.blocks ?? [])]
                blocks.push(block)
                updated[updated.length - 1] = { ...last, blocks }
                return updated
            })
        }

        try {
            const mcpToolIds = selectedMcps
                .map((name) => mcps.find((m) => m.name === name)?.id)
                .filter((id): id is string => !!id)

            await streamAgent(
                {
                    threadId,
                    provider,
                    model,
                    prompt: text,
                    mcpTools: mcpToolIds,
                    userVsFiles,
                    userVsMemories,
                },
                {
                    onChunk: (chunk) => {
                        setMessages((prev) => {
                            const updated = [...prev]
                            const last = updated[updated.length - 1]
                            const blocks = [...(last.blocks ?? [])]
                            const lastBlock = blocks[blocks.length - 1]
                            if (lastBlock?.type === "text") {
                                blocks[blocks.length - 1] = { ...lastBlock, text: lastBlock.text + chunk }
                            } else {
                                blocks.push({ type: "text", text: chunk })
                            }
                            updated[updated.length - 1] = {
                                ...last,
                                content: last.content + chunk,
                                blocks,
                            }
                            return updated
                        })
                    },
                    onToolUse: (name, input) => {
                        appendBlock({ type: "tool_use", name, content: input })
                    },
                    onToolResult: (name, content) => {
                        appendBlock({ type: "tool_result", name, content })
                        setMessages((prev) => {
                            const updated = [...prev]
                            const last = updated[updated.length - 1]
                            const blocks = [...(last.blocks ?? [])]
                            blocks.push({ type: "text", text: "" })
                            updated[updated.length - 1] = { ...last, blocks }
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

    return (
        <div className="flex h-svh flex-col bg-zinc-950 bg-[image:linear-gradient(rgba(255,255,255,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.015)_1px,transparent_1px)] bg-[size:48px_48px] bg-[position:center]">
            <AppHeader
                showNewChat={messages.length > 0}
                onNewChat={() => {
                    if (loading) abortRef.current?.abort()
                    setMessages([])
                    setThreadId(null)
                    setLoading(false)
                }}
            />

            <ChatWindow
                messages={messages}
                loading={loading}
                greeting={user ? `Hi ${user.first_name}!` : undefined}
            />

            <ChatInput
                input={input}
                onInputChange={setInput}
                onSend={handleSend}
                loading={loading}
                offerings={offerings}
                providerConfigs={providerConfigs}
                provider={provider}
                model={model}
                onModelSelect={(p, m) => { setProvider(p); setModel(m) }}
                mcps={mcps}
                selectedMcps={selectedMcps}
                onMcpToggle={(name) =>
                    setSelectedMcps((prev) =>
                        prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
                    )
                }
                userVsFiles={userVsFiles}
                onUserVsFilesToggle={() => setUserVsFiles((v) => !v)}
                userVsMemories={userVsMemories}
                onUserVsMemoriesToggle={() => setUserVsMemories((v) => !v)}
            />
        </div>
    )
}
