export type UserDocument = {
    name: string
    id: string
}

export type UserDocumentsResponse = {
    documents_scope: string
    documents: UserDocument[]
}

export async function getUserDocuments(scope: string): Promise<UserDocumentsResponse> {
    const applicationKey = import.meta.env.VITE_API_KEY
    const params = new URLSearchParams({ scope })
    const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/documents?${params}`, {
            headers: {
                'X-API-Key': applicationKey
            },
            credentials: 'include'
        }
    )

    if (!response.ok) {
        throw new Error('Failed to fetch user documents')
    }

    return response.json()
}
