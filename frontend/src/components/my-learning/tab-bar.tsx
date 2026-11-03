'use client'

interface TabBarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  counts: {
    inProgress: number
    completed: number
    badges: number
  }
}

const tabs = [
  { key: 'in-progress', label: '進行中', countKey: 'inProgress' },
  { key: 'completed', label: '已完成', countKey: 'completed' },
  { key: 'badges', label: '徽章', countKey: 'badges' },
] as const

export function TabBar({ activeTab, onTabChange, counts }: TabBarProps) {
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-700">
      <div className="flex gap-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          const count = counts[tab.countKey]
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-cyan-500'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                <span
                  className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium ${
                    isActive
                      ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300'
                      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </span>
              {isActive && (
                <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-cyan-500" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
