import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AppHeader } from "../components/app-header"
import { getUser } from "../services/get-user"

export function SettingsPage() {
    const navigate = useNavigate()

    useEffect(() => {
        getUser().catch(() => navigate("/login", { replace: true }))
    }, [navigate])

    return (
        <div className="flex min-h-svh flex-col bg-zinc-950">
            <AppHeader />
            <div className="flex-1 px-4 py-10">
            <div className="mx-auto max-w-xl">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                    Settings
                </h1>
                <p className="mt-2 text-sm text-zinc-400">
                    Manage your account and configuration.
                </p>

                <div className="mt-8 space-y-3">
                    <Link
                        to="/settings/keys"
                        className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-700 hover:bg-zinc-800/60"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-white">API Keys</span>
                                <p className="text-xs text-zinc-500">Configure API keys for your providers</p>
                            </div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </Link>
                </div>
            </div>
            </div>
        </div>
    )
}
