import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- VERIFYING MIGRATION ---')
    console.log('Checking connection to database...')

    try {
        // Check User count
        const userCount = await prisma.user.count()
        console.log(`User Count: ${userCount}`)

        // Check Submission count
        const submissionCount = await prisma.submission.count()
        console.log(`Submission Count: ${submissionCount}`)

        // Check Class count
        const classCount = await prisma.class.count()
        console.log(`Class Count: ${classCount}`)

        console.log('\nIf these numbers match your expected data (approx 383 Users, 492 Submissions), the migration is successful!')
        console.log('Connected Database URL (masked):', (process.env.POSTGRES_URL || '').replace(/:[^:]+@/, ':****@'))

    } catch (e) {
        console.error('Verification failed:', e)
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
