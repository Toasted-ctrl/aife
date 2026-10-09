export type SkillUpdatePayload = {
    skill_id: string
    instructions: string
}

export async function updateSkill(scope: string, update: SkillUpdatePayload): Promise<void> {
    const applicationKey = import.meta.env.VITE_API_KEY
    const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/skill?scope=${encodeURIComponent(scope)}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': applicationKey
            },
            credentials: 'include',
            body: JSON.stringify(update)
        }
    )

    if (!response.ok) {
        throw new Error('Failed to update skill')
    }
}
