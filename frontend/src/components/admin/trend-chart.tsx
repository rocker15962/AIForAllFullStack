'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { TrendDataPoint } from '@/types'

interface TrendChartProps {
  data: TrendDataPoint[]
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export function TrendChart({ data }: TrendChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    displayDate: formatDate(point.date),
  }))

  // "New Users This Week" covers the last 7 data points (days); the chart itself spans 30 days.
  const totalNewUsers = data.slice(-7).reduce((sum, point) => sum + point.newUsers, 0)
  // BR-39: average of each day's distinct active users across the whole range.
  const avgActiveUsers =
    data.length > 0
      ? Math.round(data.reduce((sum, point) => sum + point.activeUsers, 0) / data.length)
      : 0

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">用戶趨勢</h2>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 12, fill: '#71717a' }}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12, fill: '#71717a' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e4e4e7',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '13px' }} />
            <Line
              type="monotone"
              dataKey="activeUsers"
              name="活躍用戶"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="newUsers"
              name="新註冊"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex gap-6 border-t border-zinc-100 pt-4 dark:border-zinc-700">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">本週新用戶</p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{totalNewUsers}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">平均活躍用戶</p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{avgActiveUsers}</p>
        </div>
      </div>
    </div>
  )
}
