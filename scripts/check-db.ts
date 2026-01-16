import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- DATABASE DIAGNOSTIC ---')

    const tables = [
        'User', 'Subject', 'Class', 'Course', 'Enrollment',
        'Material', 'MaterialContent', 'Exam', 'Assignment', 'Submission'
    ]

    const client = prisma as any;
    for (const table of tables) {
        const prismaModelName = table.charAt(0).toLowerCase() + table.slice(1);
        const count = await client[prismaModelName].count()
        console.log(`${table}: ${count} rows`)
    }

    console.log('\n--- TABLE SIZES (RAW SQL) ---')
    const tableSizes = await prisma.$queryRawUnsafe(`
    SELECT
        relname AS "table_name",
        pg_size_pretty(pg_total_relation_size(relid)) AS "total_size",
        n_live_tup AS "row_count"
    FROM
        pg_stat_user_tables
    ORDER BY
        pg_total_relation_size(relid) DESC;
  `)
    console.table(tableSizes)

    const submissionsWithTemp = await prisma.submission.count({
        where: {
            tempFile: { not: null }
        }
    })
    console.log(`Submissions with tempFile (Base64): ${submissionsWithTemp}`)

    const gradedSubmissions = await prisma.submission.count({
        where: { status: 'GRADED' }
    })
    console.log(`Submissions GRADED: ${gradedSubmissions}`)

    // Try to find if there are very large tempFiles
    const samples = await prisma.submission.findMany({
        where: { tempFile: { not: null } },
        select: { tempFile: true },
        take: 10
    })

    if (samples.length > 0) {
        const avgSize = samples.reduce((acc, s) => acc + (s.tempFile?.length || 0), 0) / samples.length
        console.log(`Average tempFile size in samples: ${(avgSize / 1024).toFixed(2)} KB`)
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
