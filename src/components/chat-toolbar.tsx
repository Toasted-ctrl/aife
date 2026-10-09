import { ToolSelector } from "./tool-selector"
import { WebSearchToggle } from "./web-search-toggle"
import { SamplingSelector } from "./sampling-selector"
import type { Mcp } from "../services/get-mcps"
import type { ModelParameters } from "../services/stream-agent"

type ChatToolbarProps = {
    // When an agent is selected its own configuration applies, so the toolbar is replaced by a notice
    agentName?: string
    mcps: Mcp[]
    selectedMcps: string[]
    onMcpToggle: (mcpName: string) => void
    userVsFiles: boolean
    onUserVsFilesToggle: () => void
    userVsMemories: boolean
    onUserVsMemoriesToggle: () => void
    webSearch: boolean
    onWebSearchToggle: () => void
    parameters: ModelParameters
    onParametersChange: (parameters: ModelParameters) => void
}

export function ChatToolbar({
    agentName,
    mcps,
    selectedMcps,
    onMcpToggle,
    userVsFiles,
    onUserVsFilesToggle,
    userVsMemories,
    onUserVsMemoriesToggle,
    webSearch,
    onWebSearchToggle,
    parameters,
    onParametersChange,
}: ChatToolbarProps) {
    // Fixed height so switching between model and agent never shifts the layout
    return (
        <div className="mx-auto mb-1.5 flex h-8 max-w-2xl items-center gap-1">
            {agentName ? (
                <div className="flex min-w-0 items-center gap-1.5 px-3 text-xs text-zinc-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-amber-400/60">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4M12 8h.01" />
                    </svg>
                    <span className="truncate">
                        Using <span className="font-medium text-zinc-300">{agentName}</span> settings
                    </span>
                </div>
            ) : (
                <>
                    <ToolSelector
                        mcps={mcps}
                        selectedMcps={selectedMcps}
                        onMcpToggle={onMcpToggle}
                        userVsFiles={userVsFiles}
                        onUserVsFilesToggle={onUserVsFilesToggle}
                        userVsMemories={userVsMemories}
                        onUserVsMemoriesToggle={onUserVsMemoriesToggle}
                    />
                    <WebSearchToggle
                        enabled={webSearch}
                        onToggle={onWebSearchToggle}
                    />
                    <div className="ml-auto">
                        <SamplingSelector
                            parameters={parameters}
                            onChange={onParametersChange}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
