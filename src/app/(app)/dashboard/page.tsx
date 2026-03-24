import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-guard"
import { StatCard } from "@/components/dashboard/stat-card"
import { OccupancyChart } from "@/components/dashboard/occupancy-chart"
import { LiveStatusGrid } from "@/components/dashboard/live-status-grid"
import { LayoutGrid, CheckSquare, CalendarDays, Zap } from "lucide-react"
import type { HourlyOccupancy } from "@/types"

async function getDashboardData() {
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [totalSpaces, occupiedNow, todayCount, spaces, pastReservations, todayList] =
    await Promise.all([
      prisma.space.count({ where: { isActive: true } }),
      prisma.reservation.count({
        where: { status: "confirmed", startTime: { lte: now }, endTime: { gte: now } },
      }),
      prisma.reservation.count({
        where: { status: "confirmed", startTime: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.space.findMany({
        where: { isActive: true },
        include: { spaceType: true },
        orderBy: [{ spaceType: { name: "asc" } }, { name: "asc" }],
      }),
      prisma.reservation.findMany({
        where: { status: "confirmed", startTime: { gte: sevenDaysAgo } },
        select: { startTime: true, endTime: true },
      }),
      prisma.reservation.findMany({
        where: { status: "confirmed", startTime: { gte: todayStart }, endTime: { lte: todayEnd } },
        select: { startTime: true, endTime: true },
      }),
    ])

  // Peak hour
  const hourCounts: Record<number, number> = {}
  for (let h = 7; h <= 22; h++) hourCounts[h] = 0
  for (const r of pastReservations) {
    for (let h = 7; h <= 22; h++) {
      const slotStart = new Date(r.startTime)
      slotStart.setHours(h, 0, 0, 0)
      const slotEnd = new Date(r.startTime)
      slotEnd.setHours(h + 1, 0, 0, 0)
      if (new Date(r.startTime) < slotEnd && new Date(r.endTime) > slotStart) hourCounts[h]++
    }
  }
  const peakEntry = Object.entries(hourCounts).reduce((a, b) => (b[1] > a[1] ? b : a))
  const peakHour = `${peakEntry[0].padStart(2, "0")}:00`

  // Hourly occupancy today
  const hourlyOccupancy: HourlyOccupancy[] = []
  for (let h = 7; h <= 22; h++) {
    let count = 0
    for (const r of todayList) {
      const slotStart = new Date(todayStart)
      slotStart.setHours(h, 0, 0, 0)
      const slotEnd = new Date(todayStart)
      slotEnd.setHours(h + 1, 0, 0, 0)
      if (new Date(r.startTime) < slotEnd && new Date(r.endTime) > slotStart) count++
    }
    hourlyOccupancy.push({
      hour: `${h.toString().padStart(2, "0")}:00`,
      occupancy: totalSpaces > 0 ? Math.round((count / totalSpaces) * 100) : 0,
    })
  }

  return {
    totalSpaces,
    occupiedNow,
    occupancyPercent: totalSpaces > 0 ? Math.round((occupiedNow / totalSpaces) * 100) : 0,
    todayReservations: todayCount,
    freeSpaces: totalSpaces - occupiedNow,
    peakHour,
    spaces,
    hourlyOccupancy,
  }
}

export default async function DashboardPage() {
  await requireAuth()
  const data = await getDashboardData()

  return (
    <div className="space-y-6" style={{ animation: "var(--animate-slide-up)" }}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Vista general de la ocupación</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Ocupación actual"
          value={`${data.occupancyPercent}%`}
          sub={`${data.occupiedNow} de ${data.totalSpaces} espacios`}
          icon={LayoutGrid}
          color="#2563EB"
        />
        <StatCard
          label="Espacios libres"
          value={data.freeSpaces}
          sub="disponibles ahora"
          icon={CheckSquare}
          color="#22c55e"
        />
        <StatCard
          label="Reservas hoy"
          value={data.todayReservations}
          sub="confirmadas"
          icon={CalendarDays}
          color="#f97316"
        />
        <StatCard
          label="Hora pico"
          value={data.peakHour}
          sub="últimos 7 días"
          icon={Zap}
          color="#a855f7"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <OccupancyChart data={data.hourlyOccupancy} />
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="mb-4">
            <p className="text-sm font-medium">Tipos de espacio</p>
            <p className="text-xs text-muted-foreground">Distribución total</p>
          </div>
          <div className="space-y-3">
            {Object.entries(
              data.spaces.reduce(
                (acc, s) => {
                  const k = s.spaceType.label
                  acc[k] = (acc[k] || 0) + 1
                  return acc
                },
                {} as Record<string, number>
              )
            ).map(([label, count]) => {
              const type = data.spaces.find((s) => s.spaceType.label === label)?.spaceType
              const pct = Math.round((count / data.totalSpaces) * 100)
              return (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: type?.color }}
                      />
                      {label}
                    </span>
                    <span className="text-muted-foreground">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: type?.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Live status grid */}
      <LiveStatusGrid spaces={data.spaces} />
    </div>
  )
}
