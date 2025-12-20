import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany()
    console.log("Existing Users:")
    users.forEach(u => {
        console.log(`- Username: ${u.username}, Email: ${u.email}, Password: ${u.password}, Role: ${u.role}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
