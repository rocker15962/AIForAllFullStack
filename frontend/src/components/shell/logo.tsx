import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-1">
      <span className="text-xl font-bold text-cyan-400">AI</span>
      <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">for All</span>
    </Link>
  )
}
