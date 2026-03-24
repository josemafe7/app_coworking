"use client"

import { useActionState } from "react"
import { updateSlotConfigAction } from "@/actions/time-slots"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { SpaceType } from "@prisma/client"

interface TimeSlotManagerProps {
  spaceTypes: SpaceType[]
}

function TimeSlotItem({ spaceType }: { spaceType: SpaceType }) {
  const [state, action] = useActionState(updateSlotConfigAction, undefined)

  return (
    <div className="rounded-xl border border-border p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: spaceType.color }}
        />
        <span className="font-medium">{spaceType.label}</span>
      </div>

      <form action={action} className="space-y-3">
        <input type="hidden" name="spaceTypeId" value={spaceType.id} />
        <div className="space-y-1.5">
          <Label htmlFor={`minutes-${spaceType.id}`}>Duración mínima (minutos)</Label>
          <div className="flex items-center gap-2">
            <Input
              id={`minutes-${spaceType.id}`}
              name="minBlockMinutes"
              type="number"
              min="15"
              max="480"
              step="15"
              defaultValue={spaceType.minBlockMinutes}
              className="h-9 w-32"
            />
            <span className="text-xs text-muted-foreground">
              {spaceType.minBlockMinutes} min (≈ {Math.round(spaceType.minBlockMinutes / 30)} slots)
            </span>
          </div>
        </div>

        {state?.error && (
          <p className="text-sm text-red-500">{state.error}</p>
        )}

        <Button type="submit" size="sm" variant="outline">
          Actualizar
        </Button>
      </form>
    </div>
  )
}

export function TimeSlotManager({ spaceTypes }: TimeSlotManagerProps) {
  return (
    <div className="space-y-4">
      {spaceTypes.map((st) => (
        <TimeSlotItem key={st.id} spaceType={st} />
      ))}
    </div>
  )
}
