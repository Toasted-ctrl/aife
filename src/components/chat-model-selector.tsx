import { useState } from "react"
import type { ProvidersOffering } from "../services/get-models"

type ChatProviderDropdownProps = {
    offerings: ProvidersOffering
    onSelect?: (provider: string, model: string) => void
}

export function ChatProviderDropdown({
    offerings,
    onSelect,
}: ChatProviderDropdownProps) {
    const [open, setOpen] = useState(false)
    const [selectedProvider, setSelectedProvider] = useState("")
    const [selectedModel, setSelectedModel] = useState("")

    const providers = Object.keys(offerings.providers)

    function selectModel(provider: string, model: string) {
        setSelectedProvider(provider)
        setSelectedModel(model)
        setOpen(false)
        onSelect?.(provider, model)
    }

    return (
        <div className="relative w-full max-w-80">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="
                    flex w-full items-center gap-3
                    rounded-xl
                    border border-zinc-700
                    bg-zinc-900
                    px-3 py-2.5
                    text-left
                    shadow-sm
                    transition
                    hover:border-zinc-600
                    hover:shadow
                    focus:outline-none
                    focus:ring-2
                    focus:ring-zinc-600/30
                "
            >
                {/* Provider icon */}
                <div
                    className="
                        flex h-8 w-8 shrink-0 items-center justify-center
                        rounded-lg
                        bg-zinc-800
                        text-xs font-semibold text-zinc-300
                    "
                >
                    {selectedProvider
                        ? selectedProvider.charAt(0).toUpperCase()
                        : "✦"}
                </div>

                {/* Selected model */}
                <div className="min-w-0 flex-1">
                    {selectedModel ? (
                        <>
                            <div className="truncate text-sm font-medium text-zinc-100">
                                {selectedModel}
                            </div>

                            <div className="truncate text-xs text-zinc-500">
                                {selectedProvider}
                            </div>
                        </>
                    ) : (
                        <div className="text-sm text-zinc-500">
                            Choose a model
                        </div>
                    )}
                </div>

                {/* Chevron */}
                <svg
                    className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${
                        open ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {open && (
                <div
                    className="
                        absolute left-0 right-0 z-50 mt-2
                        overflow-hidden
                        rounded-xl
                        border border-zinc-700
                        bg-zinc-900
                        p-1
                        shadow-xl
                        shadow-black/30
                    "
                >
                    {providers.map((provider) => {
                        const models =
                            offerings.providers[provider].chat_completion

                        return (
                            <div key={provider}>
                                {/* Provider heading */}
                                <div className="px-3 pb-1 pt-2">
                                    <span className="text-xs font-medium text-zinc-400">
                                        {provider}
                                    </span>
                                </div>

                                {models.map((model) => {
                                    const selected =
                                        provider === selectedProvider &&
                                        model === selectedModel

                                    return (
                                        <button
                                            key={model}
                                            type="button"
                                            onClick={() =>
                                                selectModel(provider, model)
                                            }
                                            className={`
                                                flex w-full items-center
                                                rounded-lg px-3 py-2
                                                text-left
                                                transition
                                                ${
                                                    selected
                                                        ? "bg-zinc-800"
                                                        : "hover:bg-zinc-800/50"
                                                }
                                            `}
                                        >
                                            <span
                                                className={`
                                                    flex-1 truncate text-sm
                                                    ${
                                                        selected
                                                            ? "font-medium text-zinc-100"
                                                            : "text-zinc-300"
                                                    }
                                                `}
                                            >
                                                {model}
                                            </span>

                                            {selected && (
                                                <svg
                                                    className="h-4 w-4 text-zinc-100"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0l-3.25-3.25a1 1 0 111.42-1.42l2.54 2.54 6.54-6.54a1 1 0 011.42 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
