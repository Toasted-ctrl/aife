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
    const response = await fetch(
        `https://ai-api.beakfeather.com/api/v1/documents/user/${encodeURIComponent(scope)}`, {
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
