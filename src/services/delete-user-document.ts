export async function deleteUserDocument(documentId: string, scope: string): Promise<void> {
    const applicationKey = import.meta.env.VITE_API_KEY
    const params = new URLSearchParams({ document_id: documentId, scope })
    const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/documents?${params}`, {
            method: 'DELETE',
            headers: {
                'X-API-Key': applicationKey
            },
            credentials: 'include'
        }
    )

    if (!response.ok) {
        throw new Error('Failed to delete document')
    }
}
