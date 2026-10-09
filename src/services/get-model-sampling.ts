export type ModelSamplingSupport = {
    temperature: boolean
    top_k: boolean
    top_p: boolean
}


export type ModelSampling = {
    provider: string
    model: string
    sampling: ModelSamplingSupport
}


export async function getModelSampling(providerName: string, modelName: string): Promise<ModelSampling> {
    const applicationKey = import.meta.env.VITE_API_KEY
    const params = new URLSearchParams({ provider_name: providerName, model_name: modelName })
    const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/providers/models/sampling?${params}`, {
            headers: {
                'X-API-Key': applicationKey
            },
            credentials: 'include'
        }
    )

    if (!response.ok) {
        throw new Error('Failed to fetch model sampling')
    }

    return response.json()
}
