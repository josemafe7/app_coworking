"use client"

import { useState, useCallback } from "react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { Walls } from "./walls"
import { RoomShape } from "./room-shape"
import { WorkstationShape } from "./workstation-shape"
import { CabinShape } from "./cabin-shape"
import { ReservationForm } from "@/components/reservations/reservation-form"
import type { SpaceWithType, ReservationWithDetails } from "@/types"
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatTime } from "@/lib/utils"

type SpaceStatus = "available" | "occupied" | "soon"

function getStatus(
  spaceId: string,
  reservations: ReservationWithDetails[]
): SpaceStatus {
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

function getCurrentReservation(spaceId: string, reservations: ReservationWithDetails[]) {
  const now = new Date()
  return reservations.find(
    (r) =>
      r.spaceId === spaceId &&
      new Date(r.startTime) <= now &&
      new Date(r.endTime) >= now &&
      r.status === "confirmed"
  )
}

interface SpaceTooltipProps {
  space: SpaceWithType
  status: SpaceStatus
  reservation?: ReservationWithDetails
  x: number
  y: number
}

function SpaceTooltip({ space, status, reservation, x, y }: SpaceTooltipProps) {
  const STATUS_LABELS = { available: "Libre", occupied: "Ocupado", soon: "Próximamente" }
  const STATUS_COLORS = { available: "#22c55e", occupied: "#f97316", soon: "#3b82f6" }

  return (
    <foreignObject x={x} y={y} width="180" height="120" style={{ pointerEvents: "none" }}>
      <div
        className="bg-white rounded-lg shadow-lg border border-border p-3 text-xs"
        style={{ width: 180 }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: space.spaceType.color }}
          />
          <span className="font-semibold text-sm">{space.name}</span>
        </div>
        <div className="space-y-0.5 text-muted-foreground">
          <p>{space.spaceType.label} · {space.capacity} pers.</p>
          <p className="flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[status] }}
            />
            <span style={{ color: STATUS_COLORS[status] }}>{STATUS_LABELS[status]}</span>
          </p>
          {reservation && (
            <p className="text-[10px] mt-1 truncate">
              {reservation.title || reservation.user.name} ·{" "}
              {formatTime(new Date(reservation.startTime))}–{formatTime(new Date(reservation.endTime))}
            </p>
          )}
          {status === "available" && (
            <p className="text-primary text-[10px] font-medium mt-1">
              Click para reservar
            </p>
          )}
        </div>
      </div>
    </foreignObject>
  )
}

interface FloorPlanViewerProps {
  spaces: SpaceWithType[]
  reservations: ReservationWithDetails[]
  onRefresh?: () => void
}

export function FloorPlanViewer({ spaces, reservations, onRefresh }: FloorPlanViewerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>()

  const handleSpaceClick = useCallback((space: SpaceWithType, status: SpaceStatus) => {
    if (status === "available") {
      setSelectedSpaceId(space.id)
      setDialogOpen(true)
    }
  }, [])

  function renderSpace(space: SpaceWithType) {
    const status = getStatus(space.id, reservations)
    const reservation = getCurrentReservation(space.id, reservations)
    const hovered = hoveredId === space.id
    const type = space.spaceType.name

    const tooltipX = Math.min(space.floorX + space.floorWidth + 10, 1000)
    const tooltipY = Math.max(space.floorY - 10, 30)

    const commonProps = {
      x: space.floorX,
      y: space.floorY,
      width: space.floorWidth,
      height: space.floorHeight,
      name: space.name,
      status,
      color: space.spaceType.color,
      onClick: () => handleSpaceClick(space, status),
      onMouseEnter: () => setHoveredId(space.id),
      onMouseLeave: () => setHoveredId(null),
    }

    return (
      <g key={space.id}>
        {type === "sala" && (
          <RoomShape {...commonProps} capacity={space.capacity} />
        )}
        {type === "puesto" && <WorkstationShape {...commonProps} />}
        {type === "cabina" && <CabinShape {...commonProps} />}
        {hovered && (
          <SpaceTooltip
            space={space}
            status={status}
            reservation={reservation}
            x={tooltipX}
            y={tooltipY}
          />
        )}
      </g>
    )
  }

  return (
    <>
      <div className="relative rounded-xl border border-border overflow-hidden bg-[#FAFAFA]">
        <TransformWrapper
          initialScale={1}
          minScale={0.4}
          maxScale={3}
          limitToBounds={false}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Controls */}
              <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white shadow-sm"
                  onClick={() => zoomIn()}
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white shadow-sm"
                  onClick={() => zoomOut()}
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white shadow-sm"
                  onClick={() => resetTransform()}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%" }}
                contentStyle={{ width: "100%", height: "100%" }}
              >
                <svg
                  viewBox="0 0 1200 840"
                  style={{ width: "100%", height: "560px", display: "block" }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="1200" height="840" fill="#f8fafc" />
                  <Walls />
                  {spaces.map(renderSpace)}
                </svg>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        {[
          { label: "Libre", color: "#22c55e" },
          { label: "Ocupado", color: "#f97316" },
          { label: "Próximamente", color: "#3b82f6" },
        ].map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
        <span className="ml-auto text-[10px]">
          Arrastra para desplazar · Scroll para zoom · Click en espacio libre para reservar
        </span>
      </div>

      <ReservationForm
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        spaces={spaces}
        defaultSpaceId={selectedSpaceId}
        onSuccess={onRefresh}
      />
    </>
  )
}
