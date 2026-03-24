"use client"

import { useState } from "react"
import type { ReservationWithDetails } from "@/types"
import { formatTime } from "@/lib/utils"
import { X } from "lucide-react"
import { cancelReservationAction } from "@/actions/reservations"

const SLOT_HEIGHT = 40 // px per 30-min slot
const START_HOUR = 7

function timeToSlot(date: Date) {
  const h = date.getHours()
  const m = date.getMinutes()
  return ((h - START_HOUR) * 60 + m) / 30
}

interface ReservationBlockProps {
  reservation: ReservationWithDetails
  currentUserId?: string
  isAdmin?: boolean
  onCancel?: () => void
}

export function ReservationBlock({
  reservation,
  currentUserId,
  isAdmin,
  onCancel,
}: ReservationBlockProps) {
  const [loading, setLoading] = useState(false)
  const [hovered, setHovered] = useState(false)

  const start = new Date(reservation.startTime)
  const end = new Date(reservation.endTime)
  const startSlot = timeToSlot(start)
  const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 30) // in 30-min units

  const top = startSlot * SLOT_HEIGHT
  const height = Math.max(duration * SLOT_HEIGHT, SLOT_HEIGHT * 0.5)

  const color = reservation.space.spaceType.color
  const canCancel =
    reservation.userId === currentUserId || isAdmin
  const isPast = end < new Date()

  async function handleCancel(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm("¿Cancelar esta reserva?")) return
    setLoading(true)
    await cancelReservationAction(reservation.id)
    onCancel?.()
    setLoading(false)
  }

  return (
    <div
      className="absolute inset-x-0.5 rounded-md px-2 py-1 overflow-hidden cursor-pointer transition-all"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: `${color}22`,
        borderLeft: `3px solid ${color}`,
        opacity: isPast ? 0.6 : 1,
        zIndex: hovered ? 10 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p
            className="text-xs font-medium truncate leading-tight"
            style={{ color }}
          >
            {reservation.title || reservation.user.name}
          </p>
          {height >= 36 && (
            <p className="text-[10px] text-muted-foreground leading-tight">
              {formatTime(start)} – {formatTime(end)}
            </p>
          )}
        </div>
        {canCancel && !isPast && hovered && (
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors"
            style={{ color: "#ef4444" }}
          >
            <X className="h-2.5 w-2.5" />
          </button>
        )}
      </div>
    </div>
  )
}
