'use client'

import { useAuth } from '@/contexts/auth-context'

export function LoginButton() {
  const { login } = useAuth()

  return (
    <button
      onClick={() => login()}
      className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-600"
    >
      登入
    </button>
  )
}
