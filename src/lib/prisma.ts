import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function createPrismaClient() {
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['warn', 'error']
            : ['error'],
        datasources: {
            db: {
                url: process.env.POSTGRES_URL,
            },
        },
    })
}

// Singleton pattern - mencegah multiple PrismaClient di serverless
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}
