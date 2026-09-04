import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    console.log('--- STARTING DATABASE RESTORE ---')

    const backupPath = path.join(process.cwd(), 'backup_data.json')
    if (!fs.existsSync(backupPath)) {
        console.error('Backup file not found!')
        process.exit(1)
    }

    const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'))

    // Order is CRITICAL due to Foreign Keys
    const tableOrder = [
        'User',
        'Subject',
        'Class',
        // Enrollment depends on User + Class
        'Enrollment',
        // Course depends on Class + Subject + User
        'Course',
        // Materials depend on Course
        'Material',
        // MaterialContent depends on Material
        'MaterialContent',
        // Exam depends on Course
        'Exam',
        // Assignment depends on Course
        'Assignment',
        // Submission depends on Assignment + User
        'Submission'
    ]

    const client = prisma as any;

    for (const table of tableOrder) {
        const rows = data[table]
        if (!rows || rows.length === 0) {
            console.log(`Skipping ${table} (No data)`)
            continue
        }

        console.log(`Restoring ${table} (${rows.length} rows)...`)
        const modelName = table.charAt(0).toLowerCase() + table.slice(1);

        try {
            // We use individual create to handle potential data issues better
            let successCount = 0;
            let failCount = 0;
            for (const row of rows) {
                try {
                    await client[modelName].create({
                        data: row
                    })
                    successCount++;
                } catch (innerError) {
                    console.warn(`Failed to create ${table} row (ID: ${(row as any).id}):`, innerError)
                    failCount++;
                }
            }
            console.log(`✓ Restored ${table}: ${successCount} success, ${failCount} failed`)
        } catch (e) {
            console.error(`Error restoring ${table}:`, e)
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
