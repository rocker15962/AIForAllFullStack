import { TopNav } from '@/components/shell'
import { mainNavLinks } from '@/lib/mock-data'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNav navLinks={mainNavLinks} />
      <main>{children}</main>
    </>
  )
}
