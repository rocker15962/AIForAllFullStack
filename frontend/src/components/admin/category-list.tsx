'use client'

import { useState } from 'react'
import { Archive, GripVertical, Pencil, Plus, X, Check, Loader2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared'
import * as LucideIcons from 'lucide-react'

export interface CategoryItem {
  id: string
  name: string
  icon: string
  order: number
}

interface CategoryListProps {
  title: string
  items: CategoryItem[]
  headerColor: 'cyan' | 'amber'
  onAdd: (name: string, icon: string) => Promise<void>
  onEdit: (id: string, name: string, icon: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onReorder: (orderedIds: string[]) => Promise<void>
}

function renderIcon(iconName: string, className: string) {
  const icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string }>
  >
  // Convert kebab-case to PascalCase for lucide-react
  const pascalName = iconName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
  const IconComponent = icons[pascalName]
  if (IconComponent) {
    return <IconComponent className={className} />
  }
  // Fallback: show a generic icon
  return <LucideIcons.Circle className={className} />
}

const headerStyles = {
  cyan: 'bg-cyan-500 dark:bg-cyan-600',
  amber: 'bg-amber-500 dark:bg-amber-600',
}

export function CategoryList({
  title,
  items,
  headerColor,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
}: CategoryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editIcon, setEditIcon] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [addName, setAddName] = useState('')
  const [addIcon, setAddIcon] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  function startEdit(item: CategoryItem) {
    setEditingId(item.id)
    setEditName(item.name)
    setEditIcon(item.icon)
    setIsAdding(false)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
    setEditIcon('')
  }

  async function saveEdit() {
    if (!editingId || !editName.trim()) return
    setIsSaving(true)
    try {
      await onEdit(editingId, editName.trim(), editIcon.trim() || 'circle')
      cancelEdit()
    } finally {
      setIsSaving(false)
    }
  }

  function startAdd() {
    setIsAdding(true)
    setAddName('')
    setAddIcon('')
    setEditingId(null)
  }

  function cancelAdd() {
    setIsAdding(false)
    setAddName('')
    setAddIcon('')
  }

  async function saveAdd() {
    if (!addName.trim()) return
    setIsSaving(true)
    try {
      await onAdd(addName.trim(), addIcon.trim() || 'circle')
      cancelAdd()
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  function handleDragStart(index: number) {
    setDragIndex(index)
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    setDragOverIndex(index)
  }

  async function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }
    const ordered = items.map((item) => item.id)
    const [moved] = ordered.splice(dragIndex, 1)
    ordered.splice(index, 0, moved)
    setDragIndex(null)
    setDragOverIndex(null)
    await onReorder(ordered)
  }

  function handleDragEnd() {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      {/* Header */}
      <div className={`px-5 py-3.5 ${headerStyles[headerColor]}`}>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>

      {/* Items */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
        {items.map((item, index) => (
          <div
            key={item.id}
            draggable={editingId !== item.id}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-3 px-5 py-3 transition-colors ${
              dragIndex === index ? 'opacity-40' : ''
            } ${dragOverIndex === index && dragIndex !== index ? 'bg-cyan-50 dark:bg-cyan-900/10' : ''}`}
          >
            {editingId === item.id ? (
              /* Edit mode */
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="text"
                  value={editIcon}
                  onChange={(e) => setEditIcon(e.target.value)}
                  placeholder="Icon name"
                  className="w-24 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-cyan-400 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                />
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Category name"
                  className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-cyan-400 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                />
                <button
                  onClick={saveEdit}
                  disabled={isSaving || !editName.trim()}
                  className="rounded-lg p-1.5 text-green-600 hover:bg-green-50 disabled:opacity-50 dark:text-green-400 dark:hover:bg-green-900/20"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={isSaving}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              /* View mode */
              <>
                {/* Drag handle */}
                <div className="cursor-grab text-zinc-300 active:cursor-grabbing dark:text-zinc-600">
                  <GripVertical className="h-4 w-4" />
                </div>

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-700">
                  {renderIcon(item.icon, 'h-4 w-4 text-zinc-600 dark:text-zinc-300')}
                </div>
                <span className="flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {item.name}
                </span>

                {/* Edit / Delete */}
                <button
                  onClick={() => startEdit(item)}
                  className="rounded p-1 text-zinc-400 transition-colors hover:text-cyan-600 dark:hover:text-cyan-400"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setConfirmDeleteId(item.id)}
                  disabled={deletingId === item.id}
                  className="rounded p-1 text-red-400 transition-colors hover:text-red-600 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                  title="Archive"
                >
                  {deletingId === item.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Archive className="h-3.5 w-3.5" />
                  )}
                </button>
              </>
            )}
          </div>
        ))}

        {/* Empty state */}
        {items.length === 0 && !isAdding && (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-zinc-400">No categories yet</p>
          </div>
        )}

        {/* Add form */}
        {isAdding && (
          <div className="flex items-center gap-2 px-5 py-3">
            <input
              type="text"
              value={addIcon}
              onChange={(e) => setAddIcon(e.target.value)}
              placeholder="Icon name"
              className="w-24 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-cyan-400 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <input
              type="text"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="Category name"
              className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-cyan-400 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <button
              onClick={saveAdd}
              disabled={isSaving || !addName.trim()}
              className="rounded-lg p-1.5 text-green-600 hover:bg-green-50 disabled:opacity-50 dark:text-green-400 dark:hover:bg-green-900/20"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={cancelAdd}
              disabled={isSaving}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Add button */}
      {!isAdding && (
        <div className="border-t border-zinc-100 px-5 py-3 dark:border-zinc-700/50">
          <button
            onClick={startAdd}
            className="flex items-center gap-2 text-sm font-medium text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            <Plus className="h-4 w-4" />
            Add {title.replace(' Categories', '')}
          </button>
        </div>
      )}
      {/* Confirm delete dialog */}
      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={async () => {
          if (confirmDeleteId) {
            await handleDelete(confirmDeleteId)
            setConfirmDeleteId(null)
          }
        }}
        title={`Archive ${title.replace(' Categories', '')}?`}
        description="It will be hidden from course filters and can no longer be assigned. Courses already using it keep it."
        confirmLabel="Archive"
        isLoading={!!deletingId}
      />
    </div>
  )
}
