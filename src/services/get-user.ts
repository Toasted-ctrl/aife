export type User = {
    id: string
}


export async function getUser(): Promise<User> {
    console.log("Calling /api/v1/auth/me")
    const applicationKey = import.meta.env.VITE_API_KEY
    const response = await fetch(
        'https://ai-api.beakfeather.com/api/v1/auth/me', {
            headers: {
                'X-API-Key': applicationKey
            }
        }
    )

    if (!response.ok) {
        throw new Error('Failed to fetch user')
    }

    return response.json()
}