export type ModelParameters = {
    temperature: number
    top_k: number
    top_p: number
}

export type StreamRequest = {
    agentId?: string
    threadId?: string | null
    provider: string
    model: string
    prompt: string
    parameters?: ModelParameters
    mcpTools?: string[]
}

export type StreamCallbacks = {
    onChunk: (text: string) => void
    onThreadId?: (threadId: string) => void
    onToolUse?: (name: string, input: string) => void
    onToolResult?: (name: string, content: string) => void
}

export async function streamAgent(
    request: StreamRequest,
    callbacks: StreamCallbacks,
    signal?: AbortSignal,
) {
    const applicationKey = import.meta.env.VITE_API_KEY

    const response = await fetch(
        "https://ai-api.beakfeather.com/api/v1/agent/stream",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": applicationKey,
            },
            credentials: "include",
            signal,
            body: JSON.stringify({
                agent_id: request.agentId ?? null,
                thread_id: request.threadId ?? null,
                provider_settings: {
                    name: request.provider,
                    model: request.model,
                },
                parameters: {
                    temperature: request.parameters?.temperature ?? null,
                    top_k: request.parameters?.top_k ?? null,
                    top_p: request.parameters?.top_p ?? null

                },
                prompt: request.prompt,
                mcp_tools: request.mcpTools?.length ? request.mcpTools : null,
            }),
        },
    )

    if (!response.ok) {
        throw new Error(`Stream request failed: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error("No response body")

    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            const payload = line.slice(6)
            if (payload === "[DONE]") return

            try {
                const parsed = JSON.parse(payload)
                if (parsed.type === "message" && parsed.data) {
                    if (parsed.data.content) callbacks.onChunk(parsed.data.content)
                    const tid = parsed.data.metadata?.thread_id
                    if (tid) callbacks.onThreadId?.(tid)
                } else if (parsed.type === "tool_use" && parsed.data) {
                    const input = typeof parsed.data.input === "string"
                        ? parsed.data.input
                        : JSON.stringify(parsed.data.input ?? {}, null, 2)
                    callbacks.onToolUse?.(parsed.data.name ?? "Tool", input)
                } else if (parsed.type === "tool_result" && parsed.data) {
                    const content = typeof parsed.data.content === "string"
                        ? parsed.data.content
                        : JSON.stringify(parsed.data.content ?? "", null, 2)
                    callbacks.onToolResult?.(parsed.data.name ?? "Tool", content)
                }
            } catch {
                // skip unparseable lines
            }
        }
    }
}
