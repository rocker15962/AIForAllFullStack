'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [input, setInput] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (input !== value) {
        onChange(input)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [input, value, onChange])

  useEffect(() => {
    setInput(value)
  }, [value])

  return (
    <div className="relative">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <input
        type="text"
        placeholder="搜尋課程..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pr-10 pl-10 text-sm text-zinc-900 transition-colors outline-none focus:border-cyan-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-cyan-500"
      />
      {input && (
        <button
          onClick={() => {
            setInput('')
            onChange('')
          }}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
