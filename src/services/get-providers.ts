export type Provider = {
    id: string,
    name: string;
    internal: boolean,
    requires_api_key: boolean,
    api_key_confifured: boolean
}


export type ProvidersResponse = {
    providers: Provider[]
}


export async function getProviders(): Promise<ProvidersResponse> {
    console.log("Calling /api/v1/providers")
    const applicationKey = import.meta.env.VITE_API_KEY
    const response = await fetch(
        'https://ai-api.beakfeather.com/api/v1/providers', {
            headers: {
                'X-API-Key': applicationKey
            },
            credentials: 'include'
        }
    )

    if (!response.ok) {
        throw new Error('Failed to fetch Providers')
    }

    return response.json()
}