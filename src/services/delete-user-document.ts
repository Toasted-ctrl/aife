export async function deleteUserDocument(documentId: string): Promise<void> {
    const applicationKey = import.meta.env.VITE_API_KEY
    const response = await fetch(
        `https://ai-api.beakfeather.com/api/v1/documents/user/${encodeURIComponent(documentId)}`, {
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
