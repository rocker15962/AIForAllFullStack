'use client'

import { Info } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export function GuestBanner() {
  const { user, login } = useAuth()
  if (user) return null

  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg border-l-4 border-cyan-500 bg-cyan-50 px-4 py-3 dark:bg-cyan-900/20">
      <Info className="h-[18px] w-[18px] shrink-0 text-cyan-600" />
      <p className="flex-1 text-sm text-cyan-700 dark:text-cyan-300">
        Sign up to save your progress and earn badges
      </p>
      <button
        onClick={() => login()}
        className="shrink-0 rounded-md bg-cyan-500 px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-cyan-600"
      >
        Sign Up
      </button>
    </div>
  )
}
