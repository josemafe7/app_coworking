import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email no válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email no válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})

export const createReservationSchema = z.object({
  spaceId: z.string().min(1, "Selecciona un espacio"),
  title: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
})

export const createSpaceSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  description: z.string().optional(),
  capacity: z.number().int().min(1),
  spaceTypeId: z.string().min(1),
  floorX: z.number().optional(),
  floorY: z.number().optional(),
  floorWidth: z.number().optional(),
  floorHeight: z.number().optional(),
})

export const updateSlotConfigSchema = z.object({
  spaceTypeId: z.string().min(1),
  minBlockMinutes: z.number().int().min(15).max(480),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CreateReservationInput = z.infer<typeof createReservationSchema>
export type CreateSpaceInput = z.infer<typeof createSpaceSchema>
