"use client"

import { useState, useMemo } from "react"
import type { ReservationWithDetails, SpaceWithType } from "@/types"
import { ReservationBlock } from "./reservation-block"
import { ReservationForm } from "@/components/reservations/reservation-form"
import { Skeleton } from "@/components/ui/skeleton"
import { addMinutes } from "date-fns"

const START_HOUR = 7
const END_HOUR = 22
const SLOT_MINUTES = 30
const SLOT_HEIGHT = 40 // px
const TOTAL_SLOTS = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES // 30
const TIME_COL_WIDTH = 52

interface DayTimelineProps {
  date: Date
  spaces: SpaceWithType[]
  reservations: ReservationWithDetails[]
  currentUserId?: string
  isAdmin?: boolean
  loading?: boolean
  onRefresh?: () => void
}

function generateTimeLabels() {
  const labels = []
  for (let i = 0; i <= TOTAL_SLOTS; i++) {
    const totalMin = START_HOUR * 60 + i * SLOT_MINUTES
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    labels.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`)
  }
  return labels
}

const TIME_LABELS = generateTimeLabels()

function slotToTime(date: Date, slot: number): Date {
  const result = new Date(date)
  const totalMin = START_HOUR * 60 + slot * SLOT_MINUTES
  result.setHours(Math.floor(totalMin / 60), totalMin % 60, 0, 0)
  return result
}

export function DayTimeline({
  date,
  spaces,
  reservations,
  currentUserId,
  isAdmin,
  loading,
  onRefresh,
}: DayTimelineProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [defaultSpaceId, setDefaultSpaceId] = useState<string>()
  const [defaultStart, setDefaultStart] = useState<Date>()
  const [defaultEnd, setDefaultEnd] = useState<Date>()

  // Group spaces by type
  const grouped = useMemo(() => {
    const map = new Map<string, SpaceWithType[]>()
    for (const space of spaces) {
      const key = space.spaceType.id
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(space)
    }
    return Array.from(map.entries()).map(([, spaceList]) => spaceList)
  }, [spaces])

  const flatSpaces = grouped.flat()

  // Map reservations to spaces
  const reservationsBySpace = useMemo(() => {
    const map = new Map<string, ReservationWithDetails[]>()
    for (const r of reservations) {
      if (!map.has(r.spaceId)) map.set(r.spaceId, [])
      map.get(r.spaceId)!.push(r)
    }
    return map
  }, [reservations])

  function handleSlotClick(spaceId: string, slot: number) {
    const start = slotToTime(date, slot)
    const end = addMinutes(start, 60)
    setDefaultSpaceId(spaceId)
    setDefaultStart(start)
    setDefaultEnd(end)
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (flatSpaces.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        No hay espacios activos
      </div>
    )
  }

  const totalHeight = TOTAL_SLOTS * SLOT_HEIGHT

  return (
    <>
      <div className="overflow-auto rounded-xl border border-border bg-white">
        {/* Header row */}
        <div
          className="flex border-b border-border bg-white sticky top-0 z-20"
          style={{ paddingLeft: TIME_COL_WIDTH }}
        >
          {grouped.map((group) =>
            group.map((space, i) => (
              <div
                key={space.id}
                className="flex-shrink-0 px-2 py-2.5 text-center border-l border-border first-of-type:border-l-0"
                style={{
                  width: 120,
                  borderLeftColor:
                    i === 0 ? space.spaceType.color + "40" : undefined,
                  borderLeftWidth: i === 0 && group !== grouped[0] ? 2 : undefined,
                }}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: space.spaceType.color }}
                  />
                  <span className="text-xs font-medium leading-tight truncate w-full text-center">
                    {space.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-none">
                    {space.spaceType.label}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Body */}
        <div className="flex">
          {/* Time labels */}
          <div
            className="flex-shrink-0 sticky left-0 bg-white z-10 border-r border-border"
            style={{ width: TIME_COL_WIDTH }}
          >
            {TIME_LABELS.slice(0, -1).map((label, i) => (
              <div
                key={label}
                className="flex items-start px-2 text-[10px] text-muted-foreground font-mono"
                style={{ height: SLOT_HEIGHT, paddingTop: 4 }}
              >
                {i % 2 === 0 ? label : ""}
              </div>
            ))}
          </div>

          {/* Space columns */}
          {flatSpaces.map((space) => {
            const spaceReservations = reservationsBySpace.get(space.id) ?? []
            return (
              <div
                key={space.id}
                className="flex-shrink-0 relative border-l border-border"
                style={{ width: 120, height: totalHeight }}
              >
                {/* Slot click targets */}
                {Array.from({ length: TOTAL_SLOTS }).map((_, slot) => {
                  const slotStart = slotToTime(date, slot)
                  const slotEnd = addMinutes(slotStart, SLOT_MINUTES)
                  const isOccupied = spaceReservations.some(
                    (r) =>
                      new Date(r.startTime) < slotEnd &&
                      new Date(r.endTime) > slotStart
                  )
                  const isHour = slot % 2 === 0

                  return (
                    <div
                      key={slot}
                      className={`absolute inset-x-0 border-t transition-colors ${
                        isOccupied
                          ? "cursor-default"
                          : "hover:bg-primary/5 cursor-pointer"
                      } ${isHour ? "border-border" : "border-border/30"}`}
                      style={{ top: slot * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                      onClick={() =>
                        !isOccupied && handleSlotClick(space.id, slot)
                      }
                    />
                  )
                })}

                {/* Reservation blocks */}
                {spaceReservations.map((r) => (
                  <ReservationBlock
                    key={r.id}
                    reservation={r}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                    onCancel={onRefresh}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>

      <ReservationForm
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        spaces={spaces}
        defaultSpaceId={defaultSpaceId}
        defaultStart={defaultStart}
        defaultEnd={defaultEnd}
        onSuccess={onRefresh}
      />
    </>
  )
}
