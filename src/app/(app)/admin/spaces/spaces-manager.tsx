"use client"

import { useState, useActionState } from "react"
import { createSpaceAction, toggleSpaceAction } from "@/actions/spaces"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Space, SpaceType } from "@prisma/client"
import { Plus, ToggleLeft, ToggleRight } from "lucide-react"
import { useRouter } from "next/navigation"

type SpaceWithType = Space & { spaceType: SpaceType }

interface SpacesManagerProps {
  spaces: SpaceWithType[]
  spaceTypes: SpaceType[]
}

function CreateSpaceDialog({ spaceTypes }: { spaceTypes: SpaceType[] }) {
  const [open, setOpen] = useState(false)
  const [typeId, setTypeId] = useState("")
  const [state, action, pending] = useActionState(createSpaceAction, undefined)
  const router = useRouter()

  if (state?.success && open) {
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nuevo espacio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Crear espacio</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <input type="hidden" name="spaceTypeId" value={typeId} />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" placeholder="Sala A" required className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="capacity">Capacidad</Label>
              <Input id="capacity" name="capacity" type="number" min="1" defaultValue="1" required className="h-9" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={typeId} onValueChange={setTypeId} required>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                {spaceTypes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                      {t.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input id="description" name="description" placeholder="Descripción..." className="h-9" />
          </div>

          {state?.error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {state.error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={pending || !typeId}>
              {pending ? "Creando..." : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function SpacesManager({ spaces, spaceTypes }: SpacesManagerProps) {
  const [toggling, setToggling] = useState<string | null>(null)
  const router = useRouter()

  async function handleToggle(id: string, current: boolean) {
    setToggling(id)
    await toggleSpaceAction(id, !current)
    router.refresh()
    setToggling(null)
  }

  const grouped = spaceTypes.map((st) => ({
    type: st,
    spaces: spaces.filter((s) => s.spaceTypeId === st.id),
  }))

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateSpaceDialog spaceTypes={spaceTypes} />
      </div>

      {grouped.map(({ type, spaces: typeSpaces }) => (
        <div key={type.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: type.color }} />
            <h3 className="text-sm font-medium">{type.label}</h3>
            <span className="text-xs text-muted-foreground">({typeSpaces.length})</span>
          </div>

          <div className="rounded-xl border border-border overflow-hidden bg-white">
            {typeSpaces.length === 0 ? (
              <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                No hay espacios de este tipo
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Nombre</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Capacidad</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Descripción</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Estado</th>
                    <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {typeSpaces.map((space, i) => (
                    <tr key={space.id} className={i > 0 ? "border-t border-border" : ""}>
                      <td className="px-4 py-3 font-medium">{space.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{space.capacity} pers.</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs truncate max-w-[200px]">
                        {space.description || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={
                            space.isActive
                              ? "text-green-600 border-green-200 bg-green-50"
                              : "text-muted-foreground"
                          }
                        >
                          {space.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1.5 text-xs"
                          disabled={toggling === space.id}
                          onClick={() => handleToggle(space.id, space.isActive)}
                        >
                          {space.isActive ? (
                            <ToggleRight className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          {toggling === space.id ? "..." : space.isActive ? "Desactivar" : "Activar"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
