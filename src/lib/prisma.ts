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

// Singleton pattern - selalu gunakan satu instance PrismaClient di seluruh request/chunk
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Simpan ke globalThis baik di dev maupun prod untuk mencegah kebocoran pool koneksi database
globalForPrisma.prisma = prisma

