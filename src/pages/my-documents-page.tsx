import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/app-header'
import { FileUploadButton } from '../components/file-upload-button'
import { addToVectorStore } from '../services/add-to-vector-store'
import { getUser } from '../services/get-user'

type UploadedFile = {
    name: string
    status: 'uploading' | 'done' | 'error'
    error?: string
}

const SCOPE_MAP = {
    'vector-store': 'documents_user_files',
} as const

export function MyDocumentsPage() {
    const navigate = useNavigate()
    const [uploads, setUploads] = useState<UploadedFile[]>([])

    useEffect(() => {
        getUser().catch(() => navigate('/login', { replace: true }))
    }, [navigate])

    async function handleFileProcessed(file: { name: string; text: string }) {
        const entry: UploadedFile = { name: file.name, status: 'uploading' }
        setUploads(prev => [entry, ...prev])

        try {
            await addToVectorStore(SCOPE_MAP['vector-store'], [file.text], [{ document_name: file.name }])
            setUploads(prev =>
                prev.map(u => u === entry ? { ...u, status: 'done' } : u)
            )
        } catch (err) {
            setUploads(prev =>
                prev.map(u => u === entry
                    ? { ...u, status: 'error', error: err instanceof Error ? err.message : 'Upload failed' }
                    : u
                )
            )
        }
    }

    return (
        <div className="flex min-h-svh flex-col bg-zinc-950 bg-[image:linear-gradient(rgba(255,255,255,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.015)_1px,transparent_1px)] bg-[size:48px_48px]">
            <AppHeader />
            <div className="flex-1 px-4 py-10">
                <div className="mx-auto max-w-xl">
                    <h1 className="text-2xl font-bold tracking-tight text-white">My Documents</h1>
                    <p className="mt-2 text-sm text-zinc-400">
                        Upload documents to make them available to AI via the vector store.
                    </p>

                    <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                        <FileUploadButton
                            target="vector-store"
                            onFileProcessed={handleFileProcessed}
                        />
                    </div>

                    {uploads.length > 0 && (
                        <div className="mt-6 space-y-2">
                            <h2 className="text-sm font-medium text-zinc-400">Uploads</h2>
                            {uploads.map((upload, i) => (
                                <div
                                    key={`${upload.name}-${i}`}
                                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-zinc-500">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                        </svg>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm text-white">{upload.name}</p>
                                            <p className="text-xs text-zinc-500">Vector Store</p>
                                        </div>
                                    </div>
                                    <span className={`shrink-0 text-xs font-medium ${
                                        upload.status === 'done' ? 'text-emerald-400' :
                                        upload.status === 'error' ? 'text-red-400' :
                                        'text-amber-400'
                                    }`}>
                                        {upload.status === 'done' ? 'Done' :
                                         upload.status === 'error' ? upload.error ?? 'Failed' :
                                         'Uploading…'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
