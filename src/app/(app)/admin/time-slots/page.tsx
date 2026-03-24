import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guard"
import { TimeSlotManager } from "./time-slot-manager"

export default async function AdminTimeSlotsPage() {
  await requireAdmin()

  const spaceTypes = await prisma.spaceType.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6" style={{ animation: "var(--animate-slide-up)" }}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Franjas horarias</h1>
        <p className="text-sm text-muted-foreground">
          Configura la duración mínima por tipo de espacio
        </p>
      </div>
      <TimeSlotManager spaceTypes={spaceTypes} />
    </div>
  )
}
