import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany()
    console.log(`Found ${users.length} users. Checking for plain text passwords...`)

    for (const user of users) {
        // Simple check if password might be plain text (not starting with $2a$ etc)
        const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.length > 50

        if (!isHashed) {
            console.log(`Hashing password for user: ${user.username}`)
            const hashedPassword = await bcrypt.hash(user.password, 10)
            await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            })
        } else {
            console.log(`User ${user.username} already has a hashed password. Skipping.`)
        }
    }

    console.log("Migration completed.")
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
