import { useCallback, useEffect, useState, type ReactNode } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getSkill, type Skill } from '../services/get-skill'
import { updateSkill } from '../services/update-skill'

type SkillDetailsDialogProps = {
    skillId: string
    scope: string
    onClose: () => void
}

type SchemaProperty = {
    name: string
    type: string
    description?: string
    required: boolean
}

// Flattens the top-level properties of a JSON schema for display. Returns null if there are none.
function getSchemaProperties(schema: Record<string, unknown>): SchemaProperty[] | null {
    const props = schema.properties
    if (typeof props !== 'object' || props === null || Array.isArray(props)) return null

    const required = Array.isArray(schema.required) ? schema.required : []
    const entries = Object.entries(props as Record<string, Record<string, unknown>>)
    if (entries.length === 0) return null

    return entries.map(([name, prop]) => ({
        name,
        type: Array.isArray(prop?.type) ? prop.type.join(' | ') : String(prop?.type ?? 'any'),
        description: typeof prop?.description === 'string' ? prop.description : undefined,
        required: required.includes(name),
    }))
}

function SectionHeading({ children }: { children: ReactNode }) {
    return <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">{children}</h3>
}

export function SkillDetailsDialog({ skillId, scope, onClose }: SkillDetailsDialogProps) {
    const [skill, setSkill] = useState<Skill | null>(null)
    const [error, setError] = useState<string | null>(null)

    // null while viewing; holds the edited text while in edit mode
    const [draftInstructions, setDraftInstructions] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    const editing = draftInstructions !== null
    const dirty = editing && skill !== null && draftInstructions !== skill.instructions
    const canSave = dirty && draftInstructions.trim().length > 0 && !saving

    const requestClose = useCallback(() => {
        if (dirty && !window.confirm('Discard your unsaved changes to the instructions?')) return
        onClose()
    }, [dirty, onClose])

    function startEditing() {
        if (!skill) return
        setDraftInstructions(skill.instructions)
        setSaveError(null)
    }

    function cancelEditing() {
        setDraftInstructions(null)
        setSaveError(null)
    }

    async function handleSave() {
        if (!skill || !canSave) return
        const instructions = draftInstructions.trim()

        setSaving(true)
        setSaveError(null)
        try {
            await updateSkill(scope, { skill_id: skill.skill_id, instructions })
            setSkill({ ...skill, instructions })
            setDraftInstructions(null)
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Failed to update skill')
        } finally {
            setSaving(false)
        }
    }

    useEffect(() => {
        let cancelled = false
        getSkill(skillId, scope)
            .then(res => { if (!cancelled) setSkill(res) })
            .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load skill') })
        return () => { cancelled = true }
    }, [skillId, scope])

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') requestClose()
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [requestClose])

    useEffect(() => {
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = previousOverflow }
    }, [])

    const schema = skill?.parameter_schema ?? {}
    const schemaProperties = getSchemaProperties(schema)
    const hasSchema = Object.keys(schema).length > 0

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={requestClose} />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="skill-details-title"
                className="relative flex max-h-[85svh] w-full max-w-2xl flex-col rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl"
            >
                <div className="flex items-start justify-between gap-4 border-b border-zinc-800/60 px-6 py-4">
                    <div className="min-w-0">
                        <h2 id="skill-details-title" className="truncate text-lg font-semibold text-white">
                            {skill?.name ?? (error ? 'Skill' : 'Loading…')}
                        </h2>
                        <p className="truncate text-xs text-zinc-600">{skillId}</p>
                    </div>
                    <button
                        onClick={requestClose}
                        aria-label="Close"
                        className="flex shrink-0 cursor-pointer items-center justify-center rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
                    {error ? (
                        <p className="text-sm text-red-400">{error}</p>
                    ) : !skill ? (
                        <p className="text-sm text-zinc-500">Loading skill…</p>
                    ) : (
                        <>
                            <section className="space-y-2">
                                <SectionHeading>Description</SectionHeading>
                                <p className="whitespace-pre-wrap text-sm text-zinc-300">{skill.description}</p>
                            </section>

                            <section className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <SectionHeading>Instructions</SectionHeading>
                                    {!editing && (
                                        <button
                                            onClick={startEditing}
                                            className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 20h9" />
                                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
                                            </svg>
                                            Edit
                                        </button>
                                    )}
                                </div>
                                {editing ? (
                                    <div className="space-y-3">
                                        <textarea
                                            value={draftInstructions}
                                            onChange={e => setDraftInstructions(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave()
                                            }}
                                            aria-label="Instructions"
                                            rows={12}
                                            autoFocus
                                            className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                                        />
                                        {saveError && <p className="text-xs text-red-400">{saveError}</p>}
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={cancelEditing}
                                                disabled={saving}
                                                className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200 disabled:pointer-events-none disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={!canSave}
                                                className="cursor-pointer rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-medium text-white transition hover:border-zinc-600 hover:bg-zinc-700 disabled:pointer-events-none disabled:opacity-50"
                                            >
                                                {saving ? 'Saving…' : 'Save'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="prose prose-invert prose-sm max-w-none rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3 leading-relaxed text-zinc-300">
                                        <Markdown remarkPlugins={[remarkGfm]}>{skill.instructions}</Markdown>
                                    </div>
                                )}
                            </section>

                            <section className="space-y-2">
                                <SectionHeading>Parameters</SectionHeading>
                                {!hasSchema ? (
                                    <p className="text-sm text-zinc-500">This skill takes no parameters.</p>
                                ) : (
                                    <>
                                        {schemaProperties && (
                                            <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800">
                                                {schemaProperties.map(prop => (
                                                    <div key={prop.name} className="px-4 py-2.5">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <code className="text-sm text-white">{prop.name}</code>
                                                            <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-400">{prop.type}</span>
                                                            {prop.required && (
                                                                <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-xs text-amber-300">required</span>
                                                            )}
                                                        </div>
                                                        {prop.description && (
                                                            <p className="mt-1 text-xs text-zinc-400">{prop.description}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <details open={!schemaProperties}>
                                            <summary className="cursor-pointer text-xs text-zinc-500 transition hover:text-zinc-300">
                                                Raw JSON schema
                                            </summary>
                                            <pre className="mt-2 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3 font-mono text-xs text-zinc-300">
                                                {JSON.stringify(schema, null, 2)}
                                            </pre>
                                        </details>
                                    </>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
