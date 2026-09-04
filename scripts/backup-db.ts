import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    console.log('--- STARTING DATABASE BACKUP ---')

    const data: Record<string, any[]> = {}

    // Order matters for restoration, but for backup we just need everything.
    // We will handle order during restore.
    const tables = [
        'User',
        'Subject',
        'Class',
        'Course',
        'Enrollment',
        'Material',
        'MaterialContent',
        'Exam',
        'Assignment',
        'Submission'
    ]

    const client = prisma as any;

    for (const table of tables) {
        console.log(`Backing up ${table}...`)
        try {
            const modelName = table.charAt(0).toLowerCase() + table.slice(1);
            const rows = await client[modelName].findMany()
            data[table] = rows
            console.log(`✓ ${table}: ${rows.length} rows`)
        } catch (error) {
            console.error(`Error backing up ${table}:`, error)
        }
    }

    const backupPath = path.join(process.cwd(), 'backup_data.json')
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2))
    console.log(`\nBackup saved to: ${backupPath}`)
    console.log(`Total tables backed up: ${Object.keys(data).length}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
