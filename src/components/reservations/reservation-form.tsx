"use client"

import { useActionState, useEffect, useState } from "react"
import { createReservationAction } from "@/actions/reservations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { SpaceWithType } from "@/types"
import { format } from "date-fns"

interface ReservationFormProps {
  open: boolean
  onClose: () => void
  spaces: SpaceWithType[]
  defaultSpaceId?: string
  defaultStart?: Date
  defaultEnd?: Date
  onSuccess?: () => void
}

function toDatetimeLocal(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

export function ReservationForm({
  open,
  onClose,
  spaces,
  defaultSpaceId,
  defaultStart,
  defaultEnd,
  onSuccess,
}: ReservationFormProps) {
  const [state, action, pending] = useActionState(createReservationAction, undefined)
  const [spaceId, setSpaceId] = useState(defaultSpaceId ?? "")

  useEffect(() => {
    setSpaceId(defaultSpaceId ?? "")
  }, [defaultSpaceId, open])

  useEffect(() => {
    if (state?.success) {
      onSuccess?.()
      onClose()
    }
  }, [state?.success])

  const startVal = defaultStart ? toDatetimeLocal(defaultStart) : ""
  const endVal = defaultEnd ? toDatetimeLocal(defaultEnd) : ""

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Nueva reserva</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <input type="hidden" name="spaceId" value={spaceId} />

          <div className="space-y-1.5">
            <Label htmlFor="space">Espacio</Label>
            <Select value={spaceId} onValueChange={setSpaceId} required>
              <SelectTrigger id="space" className="h-9">
                <SelectValue placeholder="Selecciona un espacio" />
              </SelectTrigger>
              <SelectContent>
                {spaces.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: s.spaceType.color }}
                      />
                      {s.name}
                      <span className="text-xs text-muted-foreground">
                        — {s.spaceType.label}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Título (opcional)</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ej: Reunión de equipo"
              className="h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startTime">Inicio</Label>
              <Input
                id="startTime"
                name="startTime"
                type="datetime-local"
                defaultValue={startVal}
                required
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endTime">Fin</Label>
              <Input
                id="endTime"
                name="endTime"
                type="datetime-local"
                defaultValue={endVal}
                required
                className="h-9 text-sm"
              />
            </div>
          </div>

          {state?.error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {state.error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={pending || !spaceId}>
              {pending ? "Creando..." : "Crear reserva"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
