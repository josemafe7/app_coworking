import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const spaces = await prisma.space.findMany({
    where: { isActive: true },
    include: { spaceType: true },
    orderBy: [
      { spaceType: { name: "asc" } },
      { name: "asc" },
    ],
  })

  return NextResponse.json(spaces)
}
