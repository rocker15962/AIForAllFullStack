'use client'

import { useState, useEffect, useCallback } from 'react'
import { Wrench, Lightbulb, Loader2, ShieldAlert, Info } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { CategoryList } from '@/components/admin'
import type { CategoryItem } from '@/components/admin'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface ApiTool {
  id: string
  name: string
  icon: string
  order: number
}

interface ApiSkill {
  id: string
  name: string
  icon: string
  order: number
}

const statCards = [
  {
    key: 'tools' as const,
    label: 'Tool Categories',
    icon: Wrench,
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/40',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    key: 'skills' as const,
    label: 'Skill Categories',
    icon: Lightbulb,
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
] as const

export default function CategoryManagementPage() {
  const { user, accessToken, isLoading: authLoading } = useAuth()

  const [tools, setTools] = useState<ApiTool[]>([])
  const [skills, setSkills] = useState<ApiSkill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    if (!accessToken) return
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/categories`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) {
        throw new Error(`Failed to fetch categories (${res.status})`)
      }
      const data = (await res.json()) as { tools: ApiTool[]; skills: ApiSkill[] }
      setTools(data.tools || [])
      setSkills(data.skills || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    if (authLoading) return
    if (!accessToken || !user?.isAdmin) {
      setIsLoading(false)
      return
    }
    fetchCategories()
  }, [fetchCategories, authLoading, accessToken, user?.isAdmin])

  // Tool CRUD
  async function handleAddTool(name: string, icon: string) {
    if (!accessToken) return
    const res = await fetch(`${API_URL}/api/v1/admin/tools`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, icon }),
    })
    if (!res.ok) throw new Error(`Failed to add tool (${res.status})`)
    await fetchCategories()
  }

  async function handleEditTool(id: string, name: string, icon: string) {
    if (!accessToken) return
    const res = await fetch(`${API_URL}/api/v1/admin/tools/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, icon }),
    })
    if (!res.ok) throw new Error(`Failed to update tool (${res.status})`)
    await fetchCategories()
  }

  async function handleDeleteTool(id: string) {
    if (!accessToken) return
    const res = await fetch(`${API_URL}/api/v1/admin/tools/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) throw new Error(`Failed to delete tool (${res.status})`)
    await fetchCategories()
  }

  async function handleReorderTools(orderedIds: string[]) {
    if (!accessToken) return
    const res = await fetch(`${API_URL}/api/v1/admin/tools/reorder`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids: orderedIds }),
    })
    if (!res.ok) throw new Error(`Failed to reorder tools (${res.status})`)
    await fetchCategories()
  }

  // Skill CRUD
  async function handleAddSkill(name: string, icon: string) {
    if (!accessToken) return
    const res = await fetch(`${API_URL}/api/v1/admin/skills`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, icon }),
    })
    if (!res.ok) throw new Error(`Failed to add skill (${res.status})`)
    await fetchCategories()
  }

  async function handleEditSkill(id: string, name: string, icon: string) {
    if (!accessToken) return
    const res = await fetch(`${API_URL}/api/v1/admin/skills/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, icon }),
    })
    if (!res.ok) throw new Error(`Failed to update skill (${res.status})`)
    await fetchCategories()
  }

  async function handleDeleteSkill(id: string) {
    if (!accessToken) return
    const res = await fetch(`${API_URL}/api/v1/admin/skills/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) throw new Error(`Failed to delete skill (${res.status})`)
    await fetchCategories()
  }

  async function handleReorderSkills(orderedIds: string[]) {
    if (!accessToken) return
    const res = await fetch(`${API_URL}/api/v1/admin/skills/reorder`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids: orderedIds }),
    })
    if (!res.ok) throw new Error(`Failed to reorder skills (${res.status})`)
    await fetchCategories()
  }

  // Sort items by order for display
  const sortedTools: CategoryItem[] = [...tools].sort((a, b) => a.order - b.order)
  const sortedSkills: CategoryItem[] = [...skills].sort((a, b) => a.order - b.order)

  const stats = {
    tools: tools.length,
    skills: skills.length,
  }

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  // Not admin
  if (!user || !user.isAdmin) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-zinc-400" />
          <h1 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Admin access required
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            You must be an administrator to view this page.
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && tools.length === 0 && skills.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Failed to load categories
          </h1>
          <p className="mt-2 text-sm text-zinc-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-zinc-900 dark:text-zinc-100">
          Category Management
        </h1>
        <p className="mt-1 text-[15px] text-zinc-500 dark:text-zinc-400">
          Manage platform tool and skill categories, drag to reorder
        </p>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          const value = stats[card.key]
          return (
            <div
              key={card.key}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${card.iconBg}`}
              >
                <Icon className={`h-4.5 w-4.5 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{card.label}</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Two-column layout */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CategoryList
            title="Tool Categories"
            items={sortedTools}
            headerColor="cyan"
            onAdd={handleAddTool}
            onEdit={handleEditTool}
            onDelete={handleDeleteTool}
            onReorder={handleReorderTools}
          />
          <CategoryList
            title="Skill Categories"
            items={sortedSkills}
            headerColor="amber"
            onAdd={handleAddSkill}
            onEdit={handleEditSkill}
            onDelete={handleDeleteSkill}
            onReorder={handleReorderSkills}
          />
        </div>
      )}

      {/* Tips section */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-700 dark:bg-zinc-800/50">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-cyan-500" />
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Tips</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              <li>
                Use the up/down arrows to reorder categories. The order determines how they appear
                on the platform.
              </li>
              <li>
                Icon names use lucide-react format (e.g. &ldquo;bot&rdquo;, &ldquo;brain&rdquo;,
                &ldquo;code&rdquo;, &ldquo;image&rdquo;).
              </li>
              <li>
                Deleting a category will not remove courses assigned to it, but those courses will
                need to be reassigned.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
