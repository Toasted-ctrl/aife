import { useState } from "react"
import { NavDrawer } from "./nav-drawer"

type AppHeaderProps = {
    showNewChat?: boolean
    onNewChat?: () => void
}

export function AppHeader({ showNewChat, onNewChat }: AppHeaderProps) {
    const [drawerOpen, setDrawerOpen] = useState(false)

    return (
        <>
            <header className="flex shrink-0 items-center justify-between border-b border-zinc-800/60 bg-zinc-950 px-4 py-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12h18M3 6h18M3 18h18" />
                        </svg>
                    </button>
                    <h1 className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-sm font-bold text-transparent">AIFE</h1>
                </div>
                {showNewChat && onNewChat && (
                    <button
                        onClick={onNewChat}
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-amber-500/10 hover:text-amber-300"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        New chat
                    </button>
                )}
            </header>
            <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </>
    )
}
