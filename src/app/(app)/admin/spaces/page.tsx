import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guard"
import { SpacesManager } from "./spaces-manager"
import type { Space, SpaceType } from "@prisma/client"

type SpaceWithType = Space & { spaceType: SpaceType }

export default async function AdminSpacesPage() {
  await requireAdmin()

  const [spaces, spaceTypes] = await Promise.all([
    prisma.space.findMany({
      include: { spaceType: true },
      orderBy: [{ spaceType: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.spaceType.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <div className="space-y-6" style={{ animation: "var(--animate-slide-up)" }}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gestionar espacios</h1>
        <p className="text-sm text-muted-foreground">Administra salas, puestos y cabinas</p>
      </div>
      <SpacesManager spaces={spaces as SpaceWithType[]} spaceTypes={spaceTypes} />
    </div>
  )
}
