export type Mcp = {
    id: string
    name: string
}

export type McpsResponse = {
    mcps: Mcp[]
}

export async function getMcps(): Promise<McpsResponse> {
    const applicationKey = import.meta.env.VITE_API_KEY
    const response = await fetch(
        'https://ai-api.beakfeather.com/api/v1/tools/mcp', {
            headers: {
                'X-API-Key': applicationKey
            },
            credentials: 'include'
        }
    )

    if (!response.ok) {
        throw new Error('Failed to fetch MCPs')
    }

    return response.json()
}
