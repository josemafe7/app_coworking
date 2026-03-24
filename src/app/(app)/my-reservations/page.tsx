"use client"

import { useState } from "react"
import useSWR from "swr"
import { useSession } from "next-auth/react"
import type { ReservationWithDetails } from "@/types"
import { formatDate, formatTime } from "@/lib/utils"
import { cancelReservationAction } from "@/actions/reservations"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDays, MapPin, Clock, X } from "lucide-react"
import { isAfter } from "date-fns"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function MyReservationsPage() {
  const { data: session } = useSession()
  const { data: all, isLoading, mutate } = useSWR<ReservationWithDetails[]>(
    session?.user ? "/api/reservations" : null,
    fetcher
  )

  const [tab, setTab] = useState<"upcoming" | "past">("upcoming")
  const [cancelling, setCancelling] = useState<string | null>(null)

  const now = new Date()
  const myReservations = (all ?? []).filter((r) => r.userId === session?.user?.id)
  const upcoming = myReservations
    .filter((r) => isAfter(new Date(r.endTime), now) && r.status === "confirmed")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  const past = myReservations
    .filter((r) => !isAfter(new Date(r.endTime), now) || r.status === "cancelled")
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

  async function handleCancel(id: string) {
    if (!confirm("¿Cancelar esta reserva?")) return
    setCancelling(id)
    await cancelReservationAction(id)
    mutate()
    setCancelling(null)
  }

  const list = tab === "upcoming" ? upcoming : past

  return (
    <div className="space-y-6" style={{ animation: "var(--animate-slide-up)" }}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mis reservas</h1>
        <p className="text-sm text-muted-foreground">Consulta y gestiona tus reservas</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm rounded-md transition-all font-medium ${
              tab === t
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "upcoming" ? `Próximas (${upcoming.length})` : `Pasadas (${past.length})`}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CalendarDays className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            {tab === "upcoming" ? "No tienes reservas próximas" : "No hay reservas pasadas"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((r) => {
            const start = new Date(r.startTime)
            const end = new Date(r.endTime)
            const isCancelled = r.status === "cancelled"
            const isPast = !isAfter(end, now)

            return (
              <div
                key={r.id}
                className={`rounded-xl border p-4 transition-all ${
                  isCancelled
                    ? "bg-muted/30 border-border opacity-60"
                    : "bg-white border-border hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: r.space.spaceType.color }}
                      />
                      <p className="text-sm font-medium truncate">
                        {r.title || r.space.name}
                      </p>
                      {isCancelled && (
                        <Badge variant="outline" className="text-xs text-red-500 border-red-200">
                          Cancelada
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {r.space.name} — {r.space.spaceType.label}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(start)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(start)} – {formatTime(end)}
                      </span>
                    </div>
                  </div>
                  {!isCancelled && !isPast && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(r.id)}
                      disabled={cancelling === r.id}
                      className="flex-shrink-0 h-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      {cancelling === r.id ? "Cancelando..." : "Cancelar"}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
