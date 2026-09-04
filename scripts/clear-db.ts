import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- CLEANING DATABASE ---')

    // Order matters for deletion (reverse of creation)
    const tables = [
        'Submission',
        'Assignment',
        'Exam',
        'MaterialContent',
        'Material',
        'Course',
        'Enrollment',
        'Class',
        'Subject',
        'User'
    ]

    const client = prisma as any;

    for (const table of tables) {
        console.log(`Deleting ${table}...`)
        try {
            const modelName = table.charAt(0).toLowerCase() + table.slice(1);
            await client[modelName].deleteMany({})
            console.log(`✓ Cleared ${table}`)
        } catch (e) {
            console.error(`Error clearing ${table}:`, e)
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
