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
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/tools/mcp`, {
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
