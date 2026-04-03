'use client'

import { Loader2, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { CourseEditor } from '@/components/admin/course-editor'

export default function NewCoursePage() {
  const { user, isLoading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

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

  return <CourseEditor isEdit={false} />
}
