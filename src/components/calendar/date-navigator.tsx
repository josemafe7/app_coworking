"use client"

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format, addDays, subDays, isToday } from "date-fns"
import { es } from "date-fns/locale"

interface DateNavigatorProps {
  date: Date
  onChange: (date: Date) => void
}

export function DateNavigator({ date, onChange }: DateNavigatorProps) {
  const today = isToday(date)

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(subDays(date, 1))}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2 min-w-[200px] justify-center">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {format(date, "EEEE, d 'de' MMMM", { locale: es })}
        </span>
        {today && (
          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-medium">
            Hoy
          </span>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(addDays(date, 1))}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {!today && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(new Date())}
          className="text-xs text-muted-foreground h-8"
        >
          Hoy
        </Button>
      )}
    </div>
  )
}
