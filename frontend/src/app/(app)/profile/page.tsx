'use client'

import { useState, useEffect, useCallback } from 'react'
import { User as UserIcon } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export default function ProfilePage() {
  const { user, accessToken, isLoading: authLoading, login, setAuth } = useAuth()
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const authHeaders = useCallback((): HeadersInit => {
    if (!accessToken) return {}
    return {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  }, [accessToken])

  // Fetch profile on mount
  useEffect(() => {
    if (!accessToken) return

    async function fetchProfile() {
      try {
        const res = await fetch(`${API_URL}/api/v1/my/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (res.ok) {
          const data = (await res.json()) as { name: string; email: string; avatarUrl: string }
          setName(data.name)
        }
      } catch {
        // Silently handle
      }
    }

    fetchProfile()
  }, [accessToken])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!accessToken || !user) return

    setIsSaving(true)
    setMessage(null)

    try {
      const res = await fetch(`${API_URL}/api/v1/my/profile`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ name: name.trim() }),
      })

      if (res.ok) {
        const data = (await res.json()) as { name: string; email: string; avatarUrl: string }
        setAuth(accessToken, { ...user, name: data.name })
        setMessage({ type: 'success', text: 'Profile updated' })
      } else {
        const body = await res.json().catch(() => ({ error: 'Failed to update profile' }))
        setMessage({
          type: 'error',
          text: (body as { error?: string }).error || 'Failed to update profile',
        })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  // Auth loading state
  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <UserIcon className="h-8 w-8 text-zinc-400" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Sign in to view your profile
          </h2>
          <p className="mt-2 text-sm text-zinc-500">Log in to manage your account settings.</p>
          <button
            onClick={() => login('/profile')}
            className="mt-6 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-600"
          >
            Log In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-8 sm:px-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-zinc-900 dark:text-zinc-100">Profile</h1>
        <p className="mt-2 text-[15px] text-zinc-500">Manage your account settings</p>
      </div>

      {/* Profile card */}
      <div className="mx-auto max-w-lg rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
        {/* Avatar */}
        <div className="mb-6 flex items-center gap-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-16 w-16 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/30">
              <UserIcon className="h-8 w-8 text-cyan-500" />
            </div>
          )}
          <div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</p>
            <p className="text-sm text-zinc-500">{user.email}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              placeholder="Your name"
            />
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-4 rounded-lg px-3 py-2 text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving || name.trim() === ''}
            className="w-full rounded-lg bg-cyan-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  )
}
