"use client"

import useSWR from "swr"
import { FloorPlanViewer } from "@/components/floor-plan/floor-plan-viewer"
import { Skeleton } from "@/components/ui/skeleton"
import type { SpaceWithType, ReservationWithDetails } from "@/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function FloorPlanPage() {
  const { data: spaces, isLoading: loadingSpaces } = useSWR<SpaceWithType[]>(
    "/api/spaces",
    fetcher
  )
  const today = new Date().toISOString().split("T")[0]
  const { data: reservations, isLoading: loadingRes, mutate } = useSWR<ReservationWithDetails[]>(
    `/api/reservations?date=${today}`,
    fetcher,
    { refreshInterval: 30000 }
  )

  return (
    <div className="space-y-4" style={{ animation: "var(--animate-slide-up)" }}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Plano</h1>
        <p className="text-sm text-muted-foreground">
          Estado en tiempo real · Haz click en un espacio libre para reservar
        </p>
      </div>

      {loadingSpaces || loadingRes ? (
        <Skeleton className="h-[560px] w-full rounded-xl" />
      ) : (
        <FloorPlanViewer
          spaces={spaces ?? []}
          reservations={reservations ?? []}
          onRefresh={() => mutate()}
        />
      )}
    </div>
  )
}
