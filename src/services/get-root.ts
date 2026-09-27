export type RootResponse = {
    version: string
    application_name: string
    contact: {
        maintainer: string
    }
}

export async function getRoot(): Promise<RootResponse> {
    const applicationKey = import.meta.env.VITE_API_KEY
    const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/root`, {
            headers: {
                'X-API-Key': applicationKey
            },
            credentials: 'include'
        }
    )

    if (!response.ok) {
        throw new Error('Failed to fetch root info')
    }

    return response.json()
}
