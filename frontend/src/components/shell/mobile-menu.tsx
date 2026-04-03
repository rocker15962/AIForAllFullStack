'use client'

import Link from 'next/link'
import { X, LogOut } from 'lucide-react'
import { Logo } from './logo'
import { useAuth } from '@/contexts/auth-context'
import type { NavigationItem } from '@/types'

interface MobileMenuProps {
  navLinks: NavigationItem[]
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ navLinks, isOpen, onClose }: MobileMenuProps) {
  const { user, login, logout } = useAuth()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50" data-testid="mobile-menu-backdrop" onClick={onClose}>
      <nav className="h-full bg-white dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-700">
          <Logo />
          <button onClick={onClose} aria-label="close">
            <X className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        <div className="flex flex-col p-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="border-b border-zinc-100 py-3 text-base font-medium text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
            >
              {link.label}
            </Link>
          ))}

          {user && (
            <Link
              href="/profile"
              onClick={onClose}
              className="border-b border-zinc-100 py-3 text-base font-medium text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
            >
              Profile
            </Link>
          )}
        </div>

        <div className="absolute right-0 bottom-0 left-0 border-t border-zinc-200 p-4 dark:border-zinc-700">
          {user ? (
            <>
              <div className="mb-3">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.name}</p>
                <p className="text-xs text-zinc-500">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  logout()
                  onClose()
                }}
                className="flex items-center gap-2 text-sm text-red-500"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                login()
                onClose()
              }}
              className="w-full rounded-lg bg-cyan-500 py-3 text-sm font-medium text-white"
            >
              Log In
            </button>
          )}
        </div>
      </nav>
    </div>
  )
}
