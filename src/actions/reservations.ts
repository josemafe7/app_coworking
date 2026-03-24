"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createReservationSchema } from "@/lib/validators"
import { revalidatePath } from "next/cache"

export async function createReservationAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const session = await auth()
  if (!session?.user?.id) return { error: "No autorizado" }

  const raw = {
    spaceId: formData.get("spaceId"),
    title: formData.get("title") || undefined,
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
  }

  const parsed = createReservationSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { spaceId, title, startTime, endTime } = parsed.data
  const start = new Date(startTime)
  const end = new Date(endTime)

  if (end <= start) return { error: "La hora de fin debe ser posterior a la de inicio" }

  const conflict = await prisma.reservation.findFirst({
    where: {
      spaceId,
      status: "confirmed",
      AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
    },
  })

  if (conflict) return { error: "El espacio ya está reservado en ese horario" }

  await prisma.reservation.create({
    data: {
      userId: session.user.id,
      spaceId,
      title,
      startTime: start,
      endTime: end,
      status: "confirmed",
    },
  })

  revalidatePath("/reservations")
  revalidatePath("/my-reservations")
  revalidatePath("/floor-plan")
  revalidatePath("/dashboard")

  return { success: true }
}

export async function cancelReservationAction(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "No autorizado" }

  const reservation = await prisma.reservation.findUnique({ where: { id } })
  if (!reservation) return { error: "Reserva no encontrada" }

  const isOwner = reservation.userId === session.user.id
  const isAdmin = session.user.role === "admin"

  if (!isOwner && !isAdmin) return { error: "Sin permisos" }

  await prisma.reservation.update({
    where: { id },
    data: { status: "cancelled" },
  })

  revalidatePath("/reservations")
  revalidatePath("/my-reservations")
  revalidatePath("/floor-plan")
  revalidatePath("/dashboard")

  return { success: true }
}
