import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createReservationSchema } from "@/lib/validators"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date") // YYYY-MM-DD
  const userId = searchParams.get("userId")
  const spaceId = searchParams.get("spaceId")

  const where: Record<string, any> = {
    status: "confirmed",
  }

  if (date) {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)
    where.startTime = { gte: start }
    where.endTime = { lte: end }
  }

  if (userId) where.userId = userId
  if (spaceId) where.spaceId = spaceId

  const reservations = await prisma.reservation.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      space: { include: { spaceType: true } },
    },
    orderBy: { startTime: "asc" },
  })

  return NextResponse.json(reservations)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = createReservationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { spaceId, title, startTime, endTime } = parsed.data
  const start = new Date(startTime)
  const end = new Date(endTime)

  if (end <= start) {
    return NextResponse.json(
      { error: "La hora de fin debe ser posterior a la de inicio" },
      { status: 400 }
    )
  }

  // Check for overlapping reservations
  const conflict = await prisma.reservation.findFirst({
    where: {
      spaceId,
      status: "confirmed",
      AND: [
        { startTime: { lt: end } },
        { endTime: { gt: start } },
      ],
    },
  })

  if (conflict) {
    return NextResponse.json(
      { error: "El espacio ya está reservado en ese horario" },
      { status: 409 }
    )
  }

  const reservation = await prisma.reservation.create({
    data: {
      userId: session.user.id,
      spaceId,
      title,
      startTime: start,
      endTime: end,
      status: "confirmed",
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      space: { include: { spaceType: true } },
    },
  })

  return NextResponse.json(reservation, { status: 201 })
}
