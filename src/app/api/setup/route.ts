import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Create Admin
        await prisma.user.upsert({
            where: { username: 'admin' },
            update: {},
            create: {
                username: 'admin',
                password: hashedPassword,
                name: 'School Administrator',
                role: 'ADMIN',
            },
        });

        // Self-heal: ensure all required columns exist in the database
        await prisma.$executeRawUnsafe(`ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "teacherTag" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "teacherNote" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Assignment" ADD COLUMN IF NOT EXISTS "enableDriveUpload" BOOLEAN NOT NULL DEFAULT false;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Assignment" ADD COLUMN IF NOT EXISTS "driveFolderUrl" TEXT;`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Submission_teacherTag_idx" ON "Submission"("teacherTag");`);

        // Check columns
        const cols: any = await prisma.$queryRawUnsafe(`
            SELECT column_name FROM information_schema.columns WHERE lower(table_name) = 'submission';
        `);

        // Add small success check
        const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });

        return NextResponse.json({
            success: true,
            message: "Database initialized and schema migrated successfully!",
            adminCount: adminCount,
            submissionColumns: cols.map((c: any) => c.column_name)
        });
    } catch (error: any) {
        console.error("Setup Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
