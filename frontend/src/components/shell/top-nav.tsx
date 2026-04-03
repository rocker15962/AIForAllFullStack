'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Logo } from './logo'
import { UserMenu } from './user-menu'
import { MobileMenu } from './mobile-menu'
import { LoginButton } from './login-button'
import { useAuth } from '@/contexts/auth-context'
import type { NavigationItem } from '@/types'

interface TopNavProps {
  navLinks: NavigationItem[]
}

export function TopNav({ navLinks }: TopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, isLoading } = useAuth()

  return (
    <header className="flex h-14 items-center border-b border-zinc-200 bg-white px-4 md:px-10 dark:border-zinc-700 dark:bg-zinc-900">
      <Logo />

      <nav className="hidden flex-1 items-center gap-6 pl-8 md:flex">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium ${
              pathname === link.href || pathname.startsWith(link.href + '/')
                ? 'text-cyan-500'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="hidden md:block">
        {isLoading ? null : user ? <UserMenu /> : <LoginButton />}
      </div>

      <div className="ml-auto md:hidden">
        <button onClick={() => setMobileMenuOpen(true)} aria-label="menu">
          <Menu className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
        </button>
      </div>

      <MobileMenu
        navLinks={navLinks}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </header>
  )
}
