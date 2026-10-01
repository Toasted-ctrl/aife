export type ActiveTool = {
    key: string
    label: string
    onRemove: () => void
    variant?: "default" | "web"
}

type ActiveToolsBarProps = {
    tools: ActiveTool[]
}

export function ActiveToolsBar({ tools }: ActiveToolsBarProps) {
    if (tools.length === 0) return null

    // Floats above the input bar (parent must be `relative`) so toggling tools never changes layout height
    return (
        <div className="pointer-events-none absolute inset-x-0 bottom-full px-4 pb-2">
            <div className="mx-auto flex max-w-2xl flex-wrap items-center gap-1.5 px-1">
                {tools.map((tool) => (
                    <span
                        key={tool.key}
                        className={`
                            pointer-events-auto flex items-center gap-1 rounded-full py-0.5 pr-1 pl-2.5 text-[11px] font-medium backdrop-blur-sm
                            ${tool.variant === "web"
                                ? "bg-sky-950/70 text-sky-300 ring-1 ring-sky-500/30"
                                : "bg-amber-950/70 text-amber-200 ring-1 ring-amber-500/20"
                            }
                        `}
                    >
                        {tool.label}
                        <button
                            type="button"
                            onClick={tool.onRemove}
                            aria-label={`Remove ${tool.label}`}
                            className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full opacity-60 transition hover:bg-white/10 hover:opacity-100"
                        >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </span>
                ))}
            </div>
        </div>
    )
}
