'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'

export default function LoginPage() {
  const { login } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-50 via-cyan-100 to-cyan-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-10 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
        <div className="mb-6 text-center">
          <p className="text-2xl font-bold">
            <span className="text-cyan-400">AI</span>{' '}
            <span className="text-zinc-900 dark:text-zinc-100">for All</span>
          </p>
        </div>

        <h1 className="mb-2 text-center text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          歡迎回來
        </h1>
        <p className="mb-8 text-center text-sm text-zinc-500">登入以追蹤你的學習進度</p>

        <button
          onClick={() => login('/courses')}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
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
          使用 Google 帳號登入
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-600" />
          <span className="text-xs text-zinc-400">或</span>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-600" />
        </div>

        <div className="text-center">
          <Link
            href="/courses"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            不登入，直接瀏覽課程 →
          </Link>
        </div>
      </div>
    </div>
  )
}
