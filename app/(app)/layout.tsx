import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-bg-deep text-ink-primary">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile top nav + content */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <MobileNav />
        <main className="flex-1 overflow-hidden flex flex-col">
          {children}
        </main>
      </div>
    </div>
  )
}
