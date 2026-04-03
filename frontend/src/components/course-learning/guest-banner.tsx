'use client'

import { useAuth } from '@/contexts/auth-context'

export function GuestBanner() {
  const { user, login } = useAuth()

  if (user) return null

  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-700 dark:bg-amber-900/20">
      <p className="text-sm text-amber-800 dark:text-amber-300">
        Sign in to save your learning progress
      </p>
      <button
        onClick={() => login()}
        className="rounded-md bg-amber-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-600"
      >
        Log In
      </button>
    </div>
  )
}
