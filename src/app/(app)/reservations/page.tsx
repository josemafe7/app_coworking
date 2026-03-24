"use client"

import { useState, useCallback } from "react"
import { format } from "date-fns"
import { DateNavigator } from "@/components/calendar/date-navigator"
import { DayTimeline } from "@/components/calendar/day-timeline"
import { ReservationForm } from "@/components/reservations/reservation-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useReservations, useSpaces } from "@/hooks/use-reservations"
import { useSession } from "next-auth/react"

export default function ReservationsPage() {
  const [date, setDate] = useState(new Date())
  const [newOpen, setNewOpen] = useState(false)
  const { data: session } = useSession()

  const dateStr = format(date, "yyyy-MM-dd")
  const { data: reservations, mutate: mutateReservations, isLoading: loadingRes } = useReservations(dateStr)
  const { data: spaces, isLoading: loadingSpaces } = useSpaces()

  const handleRefresh = useCallback(() => {
    mutateReservations()
  }, [mutateReservations])

  return (
    <div className="space-y-4" style={{ animation: "var(--animate-slide-up)" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reservas</h1>
          <p className="text-sm text-muted-foreground">
            Vista de disponibilidad por espacio
          </p>
        </div>
        <Button size="sm" onClick={() => setNewOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nueva reserva
        </Button>
      </div>

      <div className="flex items-center justify-center py-1">
        <DateNavigator date={date} onChange={setDate} />
      </div>

      <DayTimeline
        date={date}
        spaces={spaces ?? []}
        reservations={reservations ?? []}
        currentUserId={session?.user?.id}
        isAdmin={session?.user?.role === "admin"}
        loading={loadingSpaces || loadingRes}
        onRefresh={handleRefresh}
      />

      <ReservationForm
        open={newOpen}
        onClose={() => setNewOpen(false)}
        spaces={spaces ?? []}
        onSuccess={handleRefresh}
      />
    </div>
  )
}
