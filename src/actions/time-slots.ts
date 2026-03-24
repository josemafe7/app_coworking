"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guard"
import { updateSlotConfigSchema } from "@/lib/validators"
import { revalidatePath } from "next/cache"

export async function updateSlotConfigAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  await requireAdmin()

  const raw = {
    spaceTypeId: formData.get("spaceTypeId"),
    minBlockMinutes: Number(formData.get("minBlockMinutes")),
  }

  const parsed = updateSlotConfigSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  await prisma.spaceType.update({
    where: { id: parsed.data.spaceTypeId },
    data: { minBlockMinutes: parsed.data.minBlockMinutes },
  })

  revalidatePath("/admin/time-slots")
  return { success: true }
}
