
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const assignments = await prisma.assignment.findMany({
        include: {
            course: true
        }
    });

    console.log("Assignments found:", assignments.length);
    assignments.forEach(a => {
        console.log(`ID: ${a.id} | Title: ${a.title} | Course: ${a.course.id}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
