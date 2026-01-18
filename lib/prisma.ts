import { PrismaPg } from '@prisma/adapter-pg'
import {PrismaClient} from "@/app/generated/prisma/client"

const globalForPrisma = global as unknown as {
  prisma: PrismaClient
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

let prisma = globalForPrisma.prisma

if (!prisma) {
  prisma = new PrismaClient({ adapter })
} else if (process.env.NODE_ENV !== 'production' && !('folder' in prisma)) {
  prisma = new PrismaClient({ adapter })
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma