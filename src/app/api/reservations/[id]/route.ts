import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  const reservation = await prisma.reservation.findUnique({ where: { id } })
  if (!reservation) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
  }

  const isOwner = reservation.userId === session.user.id
  const isAdmin = session.user.role === "admin"

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
  }

  await prisma.reservation.update({
    where: { id },
    data: { status: "cancelled" },
  })

  return NextResponse.json({ success: true })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      space: { include: { spaceType: true } },
    },
  })

  if (!reservation) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 })
  }

  return NextResponse.json(reservation)
}
