import { requireAuth } from "@/lib/auth-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()

  return (
    <div className="flex min-h-screen">
      <Sidebar userRole={session.user.role} />

      {/* Main content — offset by sidebar width */}
      <div className="flex flex-1 flex-col pl-[240px] transition-all duration-300">
        <Header user={session.user} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
