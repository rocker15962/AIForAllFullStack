const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

type ApiClientOptions = {
  getAccessToken: () => string | null
  onUnauthorized: () => void
}

export function createApiClient({ getAccessToken, onUnauthorized }: ApiClientOptions) {
  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getAccessToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
    if (token) {
      ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    })

    if (res.status === 401) {
      // Try refresh
      const refreshRes = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })

      if (refreshRes.ok) {
        const data = (await refreshRes.json()) as { accessToken: string }
        ;(headers as Record<string, string>)['Authorization'] = `Bearer ${data.accessToken}`

        const retryRes = await fetch(`${API_URL}${path}`, {
          ...options,
          headers,
          credentials: 'include',
        })

        if (retryRes.ok) {
          return retryRes.json() as Promise<T>
        }
      }

      onUnauthorized()
      throw new Error('Unauthorized')
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error((body as { error?: string }).error || res.statusText)
    }

    return res.json() as Promise<T>
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      }),
  }
}
