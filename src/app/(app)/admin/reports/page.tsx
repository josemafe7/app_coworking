import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guard"

export default async function AdminReportsPage() {
  await requireAdmin()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [totalReservations, uniqueUsers, byType] = await Promise.all([
    prisma.reservation.count({
      where: { status: "confirmed", createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.reservation.findMany({
      where: { status: "confirmed", createdAt: { gte: thirtyDaysAgo } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.reservation.groupBy({
      by: ["spaceId"],
      where: { status: "confirmed", createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
  ])

  // Get space names for top spaces
  const topSpaceIds = byType.slice(0, 5).map((x) => x.spaceId)
  const topSpaces = await prisma.space.findMany({
    where: { id: { in: topSpaceIds } },
    include: { spaceType: true },
  })

  return (
    <div className="space-y-6" style={{ animation: "var(--animate-slide-up)" }}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
        <p className="text-sm text-muted-foreground">
          Estadísticas de uso del espacio (últimos 30 días)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs text-muted-foreground font-medium mb-1">Reservas totales</p>
          <p className="text-3xl font-bold">{totalReservations}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs text-muted-foreground font-medium mb-1">Usuarios activos</p>
          <p className="text-3xl font-bold">{uniqueUsers.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs text-muted-foreground font-medium mb-1">Espacios usados</p>
          <p className="text-3xl font-bold">{byType.length}</p>
        </div>
      </div>

      {/* Top spaces */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h2 className="text-sm font-medium mb-4">Espacios más utilizados</h2>
        <div className="space-y-2">
          {byType.slice(0, 5).map((item, i) => {
            const space = topSpaces.find((s) => s.id === item.spaceId)
            return (
              <div key={item.spaceId} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{i + 1}.</span>
                  {space && (
                    <>
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: space.spaceType.color }}
                      />
                      <span className="text-sm">{space.name}</span>
                      <span className="text-xs text-muted-foreground">({space.spaceType.label})</span>
                    </>
                  )}
                </div>
                <span className="text-sm font-medium">{item._count.id} reservas</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
