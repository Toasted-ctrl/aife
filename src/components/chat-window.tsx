import { useEffect, useRef } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"

export type ToolBlock = {
    type: "tool_use" | "tool_result"
    name: string
    content: string
}

export type ContentBlock =
    | { type: "text"; text: string }
    | ToolBlock

export type Message = {
    role: "user" | "assistant"
    content: string
    blocks?: ContentBlock[]
}

type ChatWindowProps = {
    messages: Message[]
    loading: boolean
    greeting?: string
}

function ToolCallBlock({ block }: { block: ToolBlock }) {
    const label = block.type === "tool_use"
        ? `Called: ${block.name}`
        : `Result: ${block.name}`

    return (
        <details className="my-2 rounded-lg border border-zinc-700/50 bg-zinc-900/50">
            <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-400 select-none hover:text-zinc-300">
                <svg className="h-3.5 w-3.5 shrink-0 transition-transform [[open]>&]:rotate-90" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" />
                </svg>
                <span className="truncate">{label}</span>
            </summary>
            <pre className="max-h-64 overflow-auto border-t border-zinc-700/50 px-3 py-2 text-xs leading-relaxed text-zinc-400">
                {block.content}
            </pre>
        </details>
    )
}

export function ChatWindow({ messages, loading, greeting }: ChatWindowProps) {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    if (messages.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 overflow-y-auto">
                <p className="text-2xl font-semibold text-zinc-200">
                    {greeting || "Hello!"}
                </p>
                <p className="text-sm text-zinc-500">
                    Select a model below to start chatting.
                </p>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-2xl px-4 py-6">
                {messages.map((msg, i) =>
                    msg.role === "user" ? (
                        <div key={i} className="mb-6 flex justify-end">
                            <div className="max-w-[75%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-amber-600/20 px-4 py-2.5 text-sm leading-relaxed text-amber-100 ring-1 ring-amber-500/20">
                                {msg.content}
                            </div>
                        </div>
                    ) : (
                        <div key={i} className="mb-6 flex gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-xs font-bold text-orange-400">
                                A
                            </div>
                            <div className="min-w-0 max-w-none pt-0.5">
                                {msg.blocks?.length ? (
                                    msg.blocks.map((block, j) =>
                                        block.type === "text" ? (
                                            <div key={j} className="prose prose-invert prose-sm leading-relaxed text-zinc-300">
                                                <Markdown remarkPlugins={[remarkGfm]}>{block.text}</Markdown>
                                            </div>
                                        ) : (
                                            <ToolCallBlock key={j} block={block} />
                                        ),
                                    )
                                ) : (
                                    <div className="prose prose-invert prose-sm leading-relaxed text-zinc-300">
                                        <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    ),
                )}
                {loading && (
                    <div className="mb-6 flex gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-xs font-bold text-orange-400">
                            A
                        </div>
                        <div className="flex items-center gap-1 pt-1">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400 [animation-delay:150ms]" />
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400 [animation-delay:300ms]" />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    )
}
