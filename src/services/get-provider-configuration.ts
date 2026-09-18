export type ProviderConfiguration = {
    name: string
    requires_api_key: boolean
    api_key_configured: boolean
}


export type ProviderConfigurationResponse = {
    providers: ProviderConfiguration[]
}


export async function getProviderConfiguration(): Promise<ProviderConfigurationResponse> {
    const applicationKey = import.meta.env.VITE_API_KEY
    const response = await fetch(
        'https://ai-api.beakfeather.com/api/v1/providers/configuration', {
            headers: {
                'X-API-Key': applicationKey
            },
            credentials: 'include'
        }
    )

    if (!response.ok) {
        throw new Error('Failed to fetch provider configuration')
    }

    return response.json()
}
