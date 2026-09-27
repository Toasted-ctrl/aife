import { useEffect, useRef } from "react"
import { ChatModelSelector } from "./chat-model-selector"
import { ToolSelector } from "./tool-selector"
import type { ProvidersOffering } from "../services/get-models"
import type { ProviderConfiguration } from "../services/get-provider-configuration"
import type { Mcp } from "../services/get-mcps"

type ChatInputProps = {
    input: string
    onInputChange: (value: string) => void
    onSend: () => void
    loading: boolean
    offerings: ProvidersOffering | null
    providerConfigs: ProviderConfiguration[]
    provider: string
    model: string
    onModelSelect: (provider: string, model: string) => void
    mcps: Mcp[]
    selectedMcps: string[]
    onMcpToggle: (mcpName: string) => void
    userVsFiles: boolean
    onUserVsFilesToggle: () => void
    userVsMemories: boolean
    onUserVsMemoriesToggle: () => void
}

export function ChatInput({
    input,
    onInputChange,
    onSend,
    loading,
    offerings,
    providerConfigs,
    provider,
    model,
    onModelSelect,
    mcps,
    selectedMcps,
    onMcpToggle,
    userVsFiles,
    onUserVsFilesToggle,
    userVsMemories,
    onUserVsMemoriesToggle,
}: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        autoResize()
    }, [input])

    function autoResize() {
        const el = textareaRef.current
        
        if (!el) return
        el.style.height = "auto"
        el.style.height = Math.min(el.scrollHeight, 200) + "px"
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            onSend()
        }
    }

    const canSend = input.trim() && !loading && !!model

    return (
        <div className="shrink-0 border-t border-zinc-800/60 bg-zinc-950/80 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
            <div className="mx-auto max-w-2xl">
                <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900 shadow-lg shadow-amber-950/10 transition-colors focus-within:border-amber-500/40 focus-within:shadow-amber-500/5">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Send a message..."
                        rows={1}
                        className="w-full resize-none bg-transparent px-4 pt-3 pb-2 text-base text-zinc-100 placeholder-zinc-500 outline-none sm:text-sm"
                    />
                    <div className="flex items-center justify-between px-2 pb-2">
                        <div className="flex items-center gap-1">
                            {offerings ? (
                                <ChatModelSelector
                                    offerings={offerings}
                                    providerConfigs={providerConfigs}
                                    selectedProvider={provider}
                                    selectedModel={model}
                                    onSelect={onModelSelect}
                                />
                            ) : (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-500">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500/60" />
                                    Loading models...
                                </div>
                            )}
                            <ToolSelector
                                mcps={mcps}
                                selectedMcps={selectedMcps}
                                onMcpToggle={onMcpToggle}
                                userVsFiles={userVsFiles}
                                onUserVsFilesToggle={onUserVsFilesToggle}
                                userVsMemories={userVsMemories}
                                onUserVsMemoriesToggle={onUserVsMemoriesToggle}
                            />
                        </div>
                        <button
                            onClick={onSend}
                            disabled={!canSend}
                            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-amber-600 text-white transition-all hover:bg-amber-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
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
