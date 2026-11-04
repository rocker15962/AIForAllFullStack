import type { Metadata } from 'next'
import { DM_Sans, JetBrains_Mono } from 'next/font/google'
import { AuthProvider } from '@/contexts/auth-context'
import { ToastProvider } from '@/components/shared'
import { QueryProvider } from '@/lib/query-provider'
import './globals.css'
import { cn } from '@/lib/utils'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'AI for All - 人人都能免費學 AI',
  description: '精選 YouTube 創作者的 AI 教學影片，搭配測驗，免費學會 AI 技能',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-Hant-TW" className={cn(dmSans.variable, jetbrainsMono.variable, 'font-sans')}>
      <head>
        {/* Noto Sans TC loads at runtime: next/font/google would download its ~100 CJK
            unicode-range slices at build time, and any one failed fetch breaks the build */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- pages-router rule; the root layout covers every route */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap"
        />
      </head>
      <body className="font-sans antialiased">
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
