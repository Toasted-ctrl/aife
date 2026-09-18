export async function saveUserKey(providerName: string, apiKey: string): Promise<void> {
    const applicationKey = import.meta.env.VITE_API_KEY
    const response = await fetch(
        'https://ai-api.beakfeather.com/api/v1/settings/user/keys', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': applicationKey
            },
            credentials: 'include',
            body: JSON.stringify({
                provider: providerName,
                api_key: apiKey,
            })
        }
    )

    if (!response.ok) {
        throw new Error('Failed to save API key')
    }
}
