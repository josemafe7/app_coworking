"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guard"
import { createSpaceSchema } from "@/lib/validators"
import { revalidatePath } from "next/cache"

export async function createSpaceAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  await requireAdmin()

  const raw = {
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    capacity: Number(formData.get("capacity")),
    spaceTypeId: formData.get("spaceTypeId"),
    floorX: Number(formData.get("floorX")) || undefined,
    floorY: Number(formData.get("floorY")) || undefined,
    floorWidth: Number(formData.get("floorWidth")) || undefined,
    floorHeight: Number(formData.get("floorHeight")) || undefined,
  }

  const parsed = createSpaceSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  await prisma.space.create({ data: parsed.data })

  revalidatePath("/admin/spaces")
  revalidatePath("/floor-plan")

  return { success: true }
}

export async function updateSpaceAction(
  id: string,
  data: Partial<{
    name: string
    description: string
    capacity: number
    isActive: boolean
    floorX: number
    floorY: number
    floorWidth: number
    floorHeight: number
  }>
) {
  await requireAdmin()
  await prisma.space.update({ where: { id }, data })
  revalidatePath("/admin/spaces")
  revalidatePath("/floor-plan")
  return { success: true }
}

export async function toggleSpaceAction(id: string, isActive: boolean) {
  await requireAdmin()
  await prisma.space.update({ where: { id }, data: { isActive } })
  revalidatePath("/admin/spaces")
  return { success: true }
}

export async function deleteSpaceAction(id: string) {
  await requireAdmin()
  // Cancel all future reservations first
  await prisma.reservation.updateMany({
    where: { spaceId: id, status: "confirmed", startTime: { gte: new Date() } },
    data: { status: "cancelled" },
  })
  await prisma.space.update({ where: { id }, data: { isActive: false } })
  revalidatePath("/admin/spaces")
  return { success: true }
}
