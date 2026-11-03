'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { CheckCircle, CircleAlert, X } from 'lucide-react'

interface Toast {
  id: number
  type: 'success' | 'error'
  message: string
}
interface ToastContextValue {
  showToast: (type: 'success' | 'error', message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000)
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex w-[420px] items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3.5 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
            style={{
              borderLeftWidth: 4,
              borderLeftColor: toast.type === 'success' ? '#10b981' : '#ef4444',
            }}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="h-[18px] w-[18px] shrink-0 text-green-500" />
            ) : (
              <CircleAlert className="h-[18px] w-[18px] shrink-0 text-red-500" />
            )}
            <span className="flex-1 text-[13px] text-zinc-700 dark:text-zinc-300">
              {toast.message}
            </span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="關閉通知"
              className="shrink-0 text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
