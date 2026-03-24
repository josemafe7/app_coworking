import type { User, Space, SpaceType, Reservation } from "@prisma/client"

export type UserRole = "user" | "admin"
export type ReservationStatus = "confirmed" | "cancelled"
export type SpaceStatus = "available" | "occupied" | "reserved-soon"

export type SpaceWithType = Space & {
  spaceType: SpaceType
}

export type SpaceWithReservations = Space & {
  spaceType: SpaceType
  reservations: Reservation[]
}

export type ReservationWithDetails = Reservation & {
  user: Pick<User, "id" | "name" | "email">
  space: SpaceWithType
}

export type DashboardStats = {
  totalSpaces: number
  occupiedNow: number
  occupancyPercent: number
  todayReservations: number
  peakHour: string
  freeSpaces: number
}

export type HourlyOccupancy = {
  hour: string
  occupancy: number
}
