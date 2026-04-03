'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import type { User } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export default function AuthCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { setAuth } = useAuth()

  useEffect(() => {
    async function handleCallback() {
      const token = searchParams.get('token')
      const redirect = searchParams.get('redirect') || '/courses'

      if (!token) {
        router.replace('/login')
        return
      }

      try {
        const res = await fetch(`${API_URL}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          router.replace('/login')
          return
        }

        const user = (await res.json()) as User
        setAuth(token, user)
        router.replace(redirect)
      } catch {
        router.replace('/login')
      }
    }

    handleCallback()
  }, [searchParams, router, setAuth])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        <p className="mt-4 text-sm text-zinc-500">登入中...</p>
      </div>
    </div>
  )
}
