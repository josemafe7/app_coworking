"use client"

import useSWR from "swr"
import type { ReservationWithDetails, SpaceWithType } from "@/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useReservations(date: string) {
  return useSWR<ReservationWithDetails[]>(
    `/api/reservations?date=${date}`,
    fetcher,
    { refreshInterval: 30000 }
  )
}

export function useSpaces() {
  return useSWR<SpaceWithType[]>("/api/spaces", fetcher)
}

export function useMyReservations() {
  return useSWR<ReservationWithDetails[]>(
    "/api/reservations?userId=me",
    fetcher
  )
}
