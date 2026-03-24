"use client"

import useSWR from "swr"
import type { SpaceWithType } from "@/types"
import type { ReservationWithDetails } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function getSpaceStatus(
  spaceId: string,
  reservations: ReservationWithDetails[]
): "available" | "occupied" | "soon" {
  const now = new Date()
  const soon = new Date(now.getTime() + 30 * 60 * 1000)

  const current = reservations.find(
    (r) =>
      r.spaceId === spaceId &&
      new Date(r.startTime) <= now &&
      new Date(r.endTime) >= now &&
      r.status === "confirmed"
  )
  if (current) return "occupied"

  const upcoming = reservations.find(
    (r) =>
      r.spaceId === spaceId &&
      new Date(r.startTime) > now &&
      new Date(r.startTime) <= soon &&
      r.status === "confirmed"
  )
  if (upcoming) return "soon"

  return "available"
}

const STATUS_CONFIG = {
  available: { label: "Libre", bg: "#f0fdf4", dot: "#22c55e", text: "#15803d" },
  occupied: { label: "Ocupado", bg: "#fff7ed", dot: "#f97316", text: "#c2410c" },
  soon: { label: "Pronto", bg: "#eff6ff", dot: "#3b82f6", text: "#1d4ed8" },
}

interface LiveStatusGridProps {
  spaces: SpaceWithType[]
}

export function LiveStatusGrid({ spaces }: LiveStatusGridProps) {
  const today = new Date().toISOString().split("T")[0]
  const { data: reservations, isLoading } = useSWR<ReservationWithDetails[]>(
    `/api/reservations?date=${today}`,
    fetcher,
    { refreshInterval: 30000 }
  )

  const grouped = spaces.reduce(
    (acc, s) => {
      const key = s.spaceType.label
      if (!acc[key]) acc[key] = []
      acc[key].push(s)
      return acc
    },
    {} as Record<string, SpaceWithType[]>
  )

  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium">Estado en tiempo real</p>
          <p className="text-xs text-muted-foreground">Actualización automática cada 30s</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          En vivo
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([typeName, typeSpaces]) => (
            <div key={typeName}>
              <p className="text-xs text-muted-foreground font-medium mb-2">{typeName}</p>
              <div className="grid grid-cols-4 gap-2">
                {typeSpaces.map((space) => {
                  const status = getSpaceStatus(space.id, reservations ?? [])
                  const cfg = STATUS_CONFIG[status]
                  return (
                    <div
                      key={space.id}
                      className="rounded-lg p-2.5 transition-all"
                      style={{ backgroundColor: cfg.bg }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cfg.dot }}
                        />
                        <span className="text-[10px] font-medium truncate" style={{ color: cfg.text }}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs font-medium truncate leading-tight">{space.name}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
