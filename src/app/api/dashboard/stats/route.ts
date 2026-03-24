import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)

  const [totalSpaces, occupiedNow, todayCount] = await Promise.all([
    prisma.space.count({ where: { isActive: true } }),
    prisma.reservation.count({
      where: {
        status: "confirmed",
        startTime: { lte: now },
        endTime: { gte: now },
      },
    }),
    prisma.reservation.count({
      where: {
        status: "confirmed",
        startTime: { gte: todayStart, lte: todayEnd },
      },
    }),
  ])

  // Peak hour from last 7 days
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const pastReservations = await prisma.reservation.findMany({
    where: { status: "confirmed", startTime: { gte: sevenDaysAgo } },
    select: { startTime: true, endTime: true },
  })

  const hourCounts: Record<number, number> = {}
  for (let h = 7; h <= 22; h++) hourCounts[h] = 0

  for (const r of pastReservations) {
    for (let h = 7; h <= 22; h++) {
      const slotStart = new Date(r.startTime)
      slotStart.setHours(h, 0, 0, 0)
      const slotEnd = new Date(r.startTime)
      slotEnd.setHours(h + 1, 0, 0, 0)
      if (new Date(r.startTime) < slotEnd && new Date(r.endTime) > slotStart) {
        hourCounts[h]++
      }
    }
  }

  const peakEntry = Object.entries(hourCounts).reduce((a, b) =>
    b[1] > a[1] ? b : a
  )

  // Today's hourly occupancy
  const todayList = await prisma.reservation.findMany({
    where: {
      status: "confirmed",
      startTime: { gte: todayStart },
      endTime: { lte: todayEnd },
    },
    select: { startTime: true, endTime: true },
  })

  const hourlyOccupancy = []
  for (let h = 7; h <= 22; h++) {
    let count = 0
    for (const r of todayList) {
      const slotStart = new Date(todayStart)
      slotStart.setHours(h, 0, 0, 0)
      const slotEnd = new Date(todayStart)
      slotEnd.setHours(h + 1, 0, 0, 0)
      if (new Date(r.startTime) < slotEnd && new Date(r.endTime) > slotStart) {
        count++
      }
    }
    hourlyOccupancy.push({
      hour: `${h.toString().padStart(2, "0")}:00`,
      occupancy: totalSpaces > 0 ? Math.round((count / totalSpaces) * 100) : 0,
    })
  }

  return NextResponse.json({
    totalSpaces,
    occupiedNow,
    occupancyPercent:
      totalSpaces > 0 ? Math.round((occupiedNow / totalSpaces) * 100) : 0,
    todayReservations: todayCount,
    peakHour: `${peakEntry[0].padStart(2, "0")}:00`,
    freeSpaces: totalSpaces - occupiedNow,
    hourlyOccupancy,
  })
}
