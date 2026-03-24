# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CoWork Hub** — A coworking space reservation app with real-time occupancy tracking, interactive 2D floor plan, and admin dashboard. Full-stack Next.js application with SQLite database.

## Quick Commands

```bash
# Development
npm run dev                    # Start dev server (http://localhost:3000)
npm run build && npm run start # Production build + server

# Database
npm run db:reset              # Wipe DB and re-run migrations + seed
npm run db:seed               # Populate DB with example data (3 types, 17 spaces, 4 users, 13 reservations)
npm run db:studio             # Prisma Studio UI for DB inspection (http://localhost:5555)

# Linting
npm run lint                  # Run ESLint on src/
```

## Architecture Overview

### Stack
- **Framework:** Next.js 16+ (App Router) with React 19
- **Auth:** Auth.js v5 with Credentials provider (email/password, JWT strategy)
- **DB:** Prisma v6 (pinned to v6 for CJS compatibility with seed scripts) + SQLite
- **UI:** shadcn/ui + Tailwind CSS v4 + Radix primitives
- **Forms:** Server Actions with `useActionState` hook
- **Validation:** Zod v4 (uses `.issues` not `.errors`)
- **Charts:** Recharts 3.8
- **Data Fetching:** SWR 2.4 (client-side with polling for real-time updates)
- **Dates:** date-fns v4
- **Styling:** Tailwind CSS v4 with CSS variables for design tokens

### Critical Design Notes

**Auth.js Integration:**
- Located in `src/lib/auth.ts`
- Credentials provider validates email/password against `user.passwordHash` (hashed with bcryptjs)
- JWT strategy: role is injected into both token and session via callbacks
- Middleware in `src/middleware.ts` protects `/(app)/*` routes
- Type augmentation in `src/types/next-auth.d.ts` adds `role` and `id` to Session/JWT

**Prisma v6 (Not v7):**
- v7 outputs ESM-only, breaking `tsx`-based seed scripts
- v6 uses `prisma-client-js` generator (CJS output)
- Always use `npx tsx prisma/seed.ts` to seed (not `npx prisma db seed`)

**Zod v4 API:**
- Schema validation returns `parsed.error.issues[0].message` (not `.errors`)
- Check all validation error handling in `src/actions/` and API routes

**Server Actions:**
- Import `"use server"` at file top
- Use `useActionState` hook on client to invoke them
- Call `revalidatePath()` after mutations to refresh cache

### Directory Structure

```
src/
├── app/
│   ├── (auth)/              # Public routes: /login, /register
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/               # Protected routes (require auth via middleware)
│   │   ├── layout.tsx       # App shell: sidebar + header
│   │   ├── dashboard/       # Occupancy metrics + charts
│   │   ├── reservations/    # Day timeline calendar (main booking interface)
│   │   ├── floor-plan/      # Interactive SVG map with zoom/pan
│   │   ├── my-reservations/ # User's bookings (upcoming/past)
│   │   └── admin/           # Protected by requireAdmin() guard
│   │       ├── spaces/      # CRUD spaces
│   │       ├── time-slots/  # Config min duration per space type
│   │       └── reports/     # Usage stats (30-day)
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # Auth.js route
│   │   ├── spaces/route.ts              # GET active spaces
│   │   ├── reservations/route.ts        # GET (filtered) / POST (with conflict check)
│   │   ├── reservations/[id]/route.ts   # DELETE (cancel)
│   │   └── dashboard/stats/route.ts     # GET occupancy stats
│   ├── layout.tsx           # Root: Providers (SessionProvider, SWRConfig), fonts, TooltipProvider
│   ├── page.tsx             # Redirect logic: /dashboard if authed, else /login
│   └── globals.css          # Design tokens (CSS variables) + animations + scrollbar
├── actions/                 # Server Actions (form submission handlers)
│   ├── auth.ts              # loginAction, registerAction
│   ├── reservations.ts      # createReservationAction, cancelReservationAction
│   ├── spaces.ts            # createSpaceAction, updateSpaceAction, toggleSpaceAction
│   └── time-slots.ts        # updateSlotConfigAction
├── components/
│   ├── ui/                  # shadcn/ui primitives (button, input, dialog, etc.)
│   ├── layout/              # sidebar.tsx, header.tsx
│   ├── calendar/            # day-timeline.tsx, date-navigator.tsx, reservation-block.tsx
│   ├── floor-plan/          # floor-plan-viewer.tsx, walls.tsx, room-shape.tsx, workstation-shape.tsx, cabin-shape.tsx
│   ├── dashboard/           # stat-card.tsx, occupancy-chart.tsx, live-status-grid.tsx
│   ├── reservations/        # reservation-form.tsx (dialog component)
│   └── providers.tsx        # SessionProvider + SWRConfig wrapper
├── hooks/
│   └── use-reservations.ts  # useSWR hooks for spaces, reservations, myReservations
├── lib/
│   ├── auth.ts              # Auth.js v5 config
│   ├── auth-guard.ts        # requireAuth(), requireAdmin() helpers
│   ├── prisma.ts            # Singleton PrismaClient
│   ├── utils.ts             # cn(), formatTime(), formatDate(), formatShortDate()
│   └── validators.ts        # Zod schemas for login, register, createReservation, etc.
├── types/
│   ├── index.ts             # SpaceWithType, ReservationWithDetails, DashboardStats, HourlyOccupancy
│   └── next-auth.d.ts       # Session/JWT type augmentation (adds role, id)
└── middleware.ts            # Auth middleware protecting (app) routes
```

## Data Model

**User:** id, name, email (unique), passwordHash, role ("user" | "admin"), timestamps
**SpaceType:** id, name (unique: "sala"/"puesto"/"cabina"), label, color (hex), icon, minBlockMinutes (default 30)
**Space:** id, name, capacity, spaceTypeId (FK), floor coordinates (floorX/Y/Width/Height/Rotation), isActive, timestamps
**Reservation:** id, userId (FK), spaceId (FK), title (optional), startTime, endTime, status ("confirmed" | "cancelled"), timestamps

**Indices:** `[spaceId, startTime, endTime]` for fast conflict detection on bookings.

## Test Credentials (Auto-Seeded)

- **Admin:** `admin@cowork.com` / `admin123`
- **Regular User:** `maria@ejemplo.com` / `user123`

**Seed includes:** 3 space types, ~18 spaces (2 salas, 3 cabinas, 12+ puestos), 13 example reservations.

## Key Development Patterns

### Creating a New API Endpoint

```typescript
// src/app/api/example/route.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Use prisma, return json
  return NextResponse.json({ /* data */ })
}
```

### Creating a Server Action

```typescript
// src/actions/example.ts
"use server"

import { auth } from "@/lib/auth"
import { exampleSchema } from "@/lib/validators"
import { revalidatePath } from "next/cache"

export async function exampleAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const parsed = exampleSchema.safeParse({ /* ... */ })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  // mutate data
  revalidatePath("/path") // invalidate cache
  return { success: true }
}
```

### Client-Side Data Fetching

```typescript
// Use SWR for real-time updates
const { data, mutate, isLoading } = useSWR("/api/endpoint", fetcher, {
  refreshInterval: 30000, // poll every 30s
})

// Invoke server action from form
const [state, action] = useActionState(serverAction, undefined)
<form action={action}>...</form>
```

## Important Notes

**Timeline Component (Day Reservations):**
- CSS Grid with 30 rows (07:00–22:00, 30-min slots)
- Fixed `pl-[240px]` offset for sidebar (not responsive yet)
- Click empty slot → pre-fills dialog with spaceId + startTime/endTime
- Real-time polling via SWR (30s interval)

**Floor Plan:**
- SVG with 1200×840 viewBox (20m × 14m representation)
- react-zoom-pan-pinch for zoom/pan controls
- Space status colored: green (available), orange (occupied), blue (soon—within 30min)
- Tooltips show current occupant and click-to-book hint

**Dashboard:**
- Stats pulled server-side (no polling—just page load)
- Live status grid uses SWR polling (30s) for real-time color updates
- AreaChart (Recharts) shows hourly occupancy trend for today

**Admin Spaces Manager:**
- Uses separate `TimeSlotItem` sub-component for each SpaceType (each has own `useActionState`)
- Toggle active/inactive without full re-render

## Common Gotchas

1. **Prisma seed import:** Always use `@prisma/client` (v6), not `../../src/generated/prisma`
2. **Zod errors:** Use `.issues[0].message`, not `.errors[0].message`
3. **Type safety in API routes:** Use `Record<string, any>` for dynamic where clauses to avoid TS inference hell
4. **Session in client components:** Always wrap pages using `useSession()` with `SessionProvider` (done in root layout)
5. **Sidebar offset:** `pl-[240px]` is a hack for non-responsive sidebar collapse; consider proper state management for production

## Frontend Design System

- **Font:** Geist Sans (from next/font)
- **Primary color:** `#2563EB` (blue-600)
- **Background:** `#FAFAFA` (slate-50)
- **Muted text:** `#64748B` (slate-500)
- **Border:** `#E2E8F0` (slate-200)
- **Border radius:** 8px (Tailwind lg)
- **Space type colors:**
  - Salas: `#2563EB` (blue)
  - Puestos: `#22c55e` (green)
  - Cabinas: `#f97316` (orange)

All component animations use CSS keyframes in `globals.css` (fade-in, slide-up, float).

## Performance Notes

- SWR with `refreshInterval: 30000` for live status (avoids constant refetches)
- Dashboard stats are server-rendered (no client-side polling)
- Floor plan SVG re-renders only on space hover/click (memoization via closure)
- Use `revalidatePath()` sparingly—only on mutations that affect multiple pages
