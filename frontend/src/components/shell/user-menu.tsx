'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  if (!user) return null

  return (
    <div ref={menuRef} className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1.5">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-8 w-8 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-cyan-300" />
        )}
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{user.name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[220px] rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-700">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.name}</p>
            <p className="text-xs text-zinc-500">{user.email}</p>
          </div>

          <div className="py-1">
            <Link
              href="/my-learning"
              className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              我的學習
            </Link>
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              個人資料
            </Link>
          </div>

          <div className="border-t border-zinc-100 py-1 dark:border-zinc-700">
            <button
              onClick={() => {
                logout()
                setIsOpen(false)
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-700"
            >
              <LogOut className="h-4 w-4" />
              登出
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
