import type { Metadata } from 'next'
import { DM_Sans, JetBrains_Mono, Geist } from 'next/font/google'
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

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'AI for All - AI Education Platform',
  description: 'Learn AI skills through curated YouTube creator content',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(dmSans.variable, jetbrainsMono.variable, 'font-sans', geist.variable)}
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
