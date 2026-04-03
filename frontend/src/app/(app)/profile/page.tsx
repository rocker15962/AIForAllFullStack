'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Camera, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface ProfileData {
  name: string
  email: string
  avatarUrl: string
  provider: string
  createdAt: string
}

export default function ProfilePage() {
  const { user, accessToken, isLoading: authLoading, login, setAuth } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const authHeaders = useCallback((): HeadersInit => {
    if (!accessToken) return {}
    return { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
  }, [accessToken])

  useEffect(() => {
    if (!accessToken) return
    async function fetchProfile() {
      try {
        const res = await fetch(`${API_URL}/api/v1/my/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (res.ok) {
          const data = (await res.json()) as ProfileData
          setProfile(data)
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
        const data = (await res.json()) as { name: string }
        setAuth(accessToken, { ...user, name: data.name })
        setMessage({ type: 'success', text: 'Profile updated' })
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    )
  }

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

  const createdDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : ''

  return (
    <div className="mx-auto max-w-[840px] px-6 py-8">
      {/* ← Back */}
      <Link
        href="/my-learning"
        className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-zinc-900 dark:text-zinc-100">Profile</h1>
        <p className="mt-1 text-[15px] text-zinc-500">Manage your account information</p>
      </div>

      {/* Profile card */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
        {/* Cover banner */}
        <div className="h-[120px] bg-gradient-to-r from-cyan-100 via-cyan-50 to-zinc-100 dark:from-cyan-900/30 dark:via-zinc-800 dark:to-zinc-800" />

        {/* Avatar section */}
        <div className="relative h-[50px]">
          <div className="absolute -top-10 left-8 h-20 w-20 rounded-full border-4 border-white bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-700">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-full w-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full">
                <UserIcon className="h-8 w-8 text-zinc-400" />
              </div>
            )}
          </div>
          <div className="absolute top-4 left-[88px] flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500">
            <Camera className="h-3.5 w-3.5 text-white" />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-5 px-8 pt-2 pb-8">
          {/* Name field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-lg border border-zinc-300 bg-white px-3.5 text-sm text-zinc-900 transition-colors outline-none focus:border-cyan-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Email field (disabled) */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={profile?.email || user.email}
              disabled
              className="h-11 rounded-lg border border-zinc-200 bg-zinc-100 px-3.5 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
            />
            <p className="text-xs text-zinc-400">Signed in via Google, cannot be changed</p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`rounded-lg px-3 py-2 text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSaving || name.trim() === ''}
              className="flex-1 rounded-lg bg-cyan-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href="/my-learning"
              className="flex items-center justify-center rounded-lg border border-zinc-200 px-6 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Account created */}
      {createdDate && (
        <p className="mt-4 text-[13px] text-zinc-400">Account created on {createdDate}</p>
      )}
    </div>
  )
}
