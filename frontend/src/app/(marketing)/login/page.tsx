'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function LoginPage() {
  const { login, logout } = useAuth()
  const router = useRouter()

  async function handleSkip() {
    await logout()
    router.push('/courses')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-cyan-50 to-white dark:from-zinc-900 dark:to-zinc-900">
      <div className="flex w-[440px] flex-col items-center gap-6 rounded-2xl bg-white p-10 shadow-[0_4px_24px_rgba(0,0,0,0.07)] dark:bg-zinc-800">
        {/* Logo */}
        <p className="text-xl font-bold">
          <span className="text-cyan-500">AI</span>{' '}
          <span className="text-zinc-900 dark:text-zinc-100">for All</span>
        </p>

        {/* Title group */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-[28px] font-bold text-zinc-900 dark:text-zinc-100">Welcome Back</h1>
          <p className="text-center text-sm text-zinc-500">
            Sign in to track your progress and earn badges
          </p>
        </div>

        {/* Auth buttons */}
        <div className="flex w-full flex-col gap-3">
          {/* Google */}
          <button
            onClick={() => login('/courses')}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-[10px] border border-zinc-300 bg-white text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Facebook */}
          <button
            onClick={() => login('/courses')}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-[10px] bg-[#1877F2] text-sm font-medium text-white transition-colors hover:bg-[#1565D8]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continue with Facebook
          </button>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-zinc-200 dark:bg-zinc-700" />

        {/* Skip link */}
        <button
          onClick={handleSkip}
          className="text-sm font-medium text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400"
        >
          Continue without signing in
        </button>
      </div>
    </div>
  )
}
