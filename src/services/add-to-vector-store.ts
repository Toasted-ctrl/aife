export type VectorStoreMetadata = {
    document_name: string
}

export async function addToVectorStore(
    scope: string,
    texts: string[],
    metadatas: VectorStoreMetadata[]
): Promise<void> {
    const applicationKey = import.meta.env.VITE_API_KEY
    const response = await fetch(
        `https://ai-api.beakfeather.com/api/v1/vector_store/${encodeURIComponent(scope)}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': applicationKey
            },
            credentials: 'include',
            body: JSON.stringify({ texts, metadatas })
        }
    )

    if (!response.ok) {
        throw new Error('Failed to add documents to vector store')
    }
}
