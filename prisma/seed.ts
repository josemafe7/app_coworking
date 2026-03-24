import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  await prisma.reservation.deleteMany()
  await prisma.space.deleteMany()
  await prisma.spaceType.deleteMany()
  await prisma.user.deleteMany()

  const salaType = await prisma.spaceType.create({
    data: { name: "sala", label: "Sala de Reuniones", color: "#3B82F6", icon: "users", minBlockMinutes: 60 },
  })
  const puestoType = await prisma.spaceType.create({
    data: { name: "puesto", label: "Puesto de Trabajo", color: "#8B5CF6", icon: "monitor", minBlockMinutes: 30 },
  })
  const cabinaType = await prisma.spaceType.create({
    data: { name: "cabina", label: "Cabina Privada", color: "#F59E0B", icon: "phone", minBlockMinutes: 30 },
  })

  const salaA = await prisma.space.create({
    data: { name: "Sala Tramontana", description: "Sala grande con proyector y pizarra", capacity: 8, spaceTypeId: salaType.id, floorX: 40, floorY: 380, floorWidth: 200, floorHeight: 160 },
  })
  const salaB = await prisma.space.create({
    data: { name: "Sala Levante", description: "Sala mediana con pantalla", capacity: 4, spaceTypeId: salaType.id, floorX: 40, floorY: 580, floorWidth: 200, floorHeight: 120 },
  })

  const cabina1 = await prisma.space.create({
    data: { name: "Cabina 1", description: "Cabina telefonica individual", capacity: 1, spaceTypeId: cabinaType.id, floorX: 40, floorY: 80, floorWidth: 100, floorHeight: 90 },
  })
  const cabina2 = await prisma.space.create({
    data: { name: "Cabina 2", description: "Cabina telefonica individual", capacity: 1, spaceTypeId: cabinaType.id, floorX: 160, floorY: 80, floorWidth: 100, floorHeight: 90 },
  })
  const cabina3 = await prisma.space.create({
    data: { name: "Cabina 3", description: "Cabina telefonica individual", capacity: 1, spaceTypeId: cabinaType.id, floorX: 40, floorY: 200, floorWidth: 100, floorHeight: 90 },
  })

  const puestos = []
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const num = row * 4 + col + 1
      const p = await prisma.space.create({
        data: { name: `Puesto ${num}`, description: "Puesto individual con monitor", capacity: 1, spaceTypeId: puestoType.id, floorX: 420 + col * 150, floorY: 120 + row * 170, floorWidth: 120, floorHeight: 100 },
      })
      puestos.push(p)
    }
  }

  const adminPw = await hash("admin123", 10)
  const userPw = await hash("user123", 10)

  const admin = await prisma.user.create({ data: { name: "Admin CoWork", email: "admin@cowork.com", passwordHash: adminPw, role: "admin" } })
  const user1 = await prisma.user.create({ data: { name: "Maria Garcia", email: "maria@ejemplo.com", passwordHash: userPw, role: "user" } })
  const user2 = await prisma.user.create({ data: { name: "Carlos Lopez", email: "carlos@ejemplo.com", passwordHash: userPw, role: "user" } })
  const user3 = await prisma.user.create({ data: { name: "Ana Martinez", email: "ana@ejemplo.com", passwordHash: userPw, role: "user" } })

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
  const md = (b: Date, h: number, m = 0) => { const d = new Date(b); d.setHours(h, m, 0, 0); return d }

  const reservations = [
    { userId: user1.id, spaceId: salaA.id, title: "Reunion de equipo", startTime: md(today, 9), endTime: md(today, 10, 30) },
    { userId: user2.id, spaceId: salaA.id, title: "Sprint planning", startTime: md(today, 11), endTime: md(today, 12) },
    { userId: user3.id, spaceId: salaB.id, title: "Call con cliente", startTime: md(today, 10), endTime: md(today, 11) },
    { userId: user1.id, spaceId: cabina1.id, title: "Llamada privada", startTime: md(today, 14), endTime: md(today, 14, 30) },
    { userId: user2.id, spaceId: cabina2.id, title: "Entrevista telefonica", startTime: md(today, 15), endTime: md(today, 16) },
    { userId: user1.id, spaceId: puestos[0].id, title: "Trabajo concentrado", startTime: md(today, 8), endTime: md(today, 13) },
    { userId: user2.id, spaceId: puestos[1].id, title: "Desarrollo frontend", startTime: md(today, 9), endTime: md(today, 17) },
    { userId: user3.id, spaceId: puestos[4].id, title: "Diseno UX", startTime: md(today, 10), endTime: md(today, 15) },
    { userId: user1.id, spaceId: puestos[7].id, title: "Analisis de datos", startTime: md(today, 8, 30), endTime: md(today, 12, 30) },
    { userId: user3.id, spaceId: puestos[9].id, title: "Documentacion", startTime: md(today, 14), endTime: md(today, 18) },
    { userId: user2.id, spaceId: salaA.id, title: "Retrospectiva", startTime: md(tomorrow, 10), endTime: md(tomorrow, 11, 30) },
    { userId: user1.id, spaceId: puestos[2].id, title: "Programacion", startTime: md(tomorrow, 9), endTime: md(tomorrow, 14) },
    { userId: user3.id, spaceId: cabina3.id, title: "Llamada internacional", startTime: md(tomorrow, 16), endTime: md(tomorrow, 17) },
  ]

  for (const r of reservations) await prisma.reservation.create({ data: r })

  console.log("Seed completed!")
  console.log("3 space types, 17 spaces, 4 users, " + reservations.length + " reservations")
  console.log("Admin: admin@cowork.com / admin123")
  console.log("User:  maria@ejemplo.com / user123")
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
