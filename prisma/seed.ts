import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Admin
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: hashedPassword,
            name: 'School Administrator',
            role: 'ADMIN',
        },
    });

    // 2. Create Teachers
    const guruInfor = await prisma.user.upsert({
        where: { username: 'guru_infor' },
        update: {},
        create: {
            username: 'guru_infor',
            password: hashedPassword,
            name: 'Budi Santoso (Informatika)',
            role: 'TEACHER',
        },
    });

    const guruKka = await prisma.user.upsert({
        where: { username: 'guru_kka' },
        update: {},
        create: {
            username: 'guru_kka',
            password: hashedPassword,
            name: 'Siti Aminah (KKA)',
            role: 'TEACHER',
        },
    });

    // 3. Create Subjects
    const subInfor = await prisma.subject.upsert({
        where: { name: 'Informatika' },
        update: {},
        create: { name: 'Informatika' },
    });

    const subKka = await prisma.subject.upsert({
        where: { name: 'KKA' },
        update: {},
        create: { name: 'KKA' },
    });

    // 4. Create Class (Rombel)
    const rombelX1 = await prisma.class.upsert({
        where: { code: 'X12345' },
        update: {},
        create: {
            name: 'X-1',
            code: 'X12345',
            description: 'Kelas 10 Rombel 1',
        },
    });

    // 5. Create Courses (Assign Subject + Teacher to Class)
    // Connect Informatika to X-1 with Guru Budi
    await prisma.course.upsert({
        where: {
            classId_subjectId: {
                classId: rombelX1.id,
                subjectId: subInfor.id
            }
        },
        update: {},
        create: {
            classId: rombelX1.id,
            subjectId: subInfor.id,
            teacherId: guruInfor.id
        }
    });

    // Connect KKA to X-1 with Guru Siti
    await prisma.course.upsert({
        where: {
            classId_subjectId: {
                classId: rombelX1.id,
                subjectId: subKka.id
            }
        },
        update: {},
        create: {
            classId: rombelX1.id,
            subjectId: subKka.id,
            teacherId: guruKka.id
        }
    });

    console.log("Seeding completed.");
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
