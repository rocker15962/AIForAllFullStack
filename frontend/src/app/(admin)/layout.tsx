import { TopNav } from '@/components/shell'
import { adminNavLinks } from '@/lib/mock-data'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNav navLinks={adminNavLinks} />
      <main>{children}</main>
    </>
  )
}
