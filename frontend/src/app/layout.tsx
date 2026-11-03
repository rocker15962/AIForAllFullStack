import type { Metadata } from 'next'
import { DM_Sans, JetBrains_Mono, Geist, Noto_Sans_TC } from 'next/font/google'
import { AuthProvider } from '@/contexts/auth-context'
import { ToastProvider } from '@/components/shared'
import { QueryProvider } from '@/lib/query-provider'
import './globals.css'
import { cn } from '@/lib/utils'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
})

// CJK font for Traditional Chinese text; it has no CJK subset to preload, so preloading is off
const notoSansTC = Noto_Sans_TC({
  variable: '--font-noto-sans-tc',
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: false,
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
    <html
      lang="zh-Hant-TW"
      className={cn(
        dmSans.variable,
        notoSansTC.variable,
        jetbrainsMono.variable,
        'font-sans',
        geist.variable,
      )}
    >
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
