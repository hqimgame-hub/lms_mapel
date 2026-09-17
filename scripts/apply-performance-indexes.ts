import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyPerformanceIndexes() {
    console.log('🚀 Checking and applying performance indexes & schema updates...\n');

    try {
        // Ensure columns exist (from auto-migrate.ts)
        console.log('1. Ensuring columns in Submission and Assignment...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "teacherTag" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "teacherNote" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Assignment" ADD COLUMN IF NOT EXISTS "enableDriveUpload" BOOLEAN NOT NULL DEFAULT false;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Assignment" ADD COLUMN IF NOT EXISTS "driveFolderUrl" TEXT;`);
        console.log('✅ Columns verified.\n');

        // Create indexes
        console.log('2. Creating performance indexes...');
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Submission_status_idx" ON "Submission"("status");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Submission_assignmentId_idx" ON "Submission"("assignmentId");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Submission_teacherTag_idx" ON "Submission"("teacherTag");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Assignment_courseId_idx" ON "Assignment"("courseId");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Assignment_published_idx" ON "Assignment"("published");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Enrollment_classId_idx" ON "Enrollment"("classId");`);
        console.log('✅ Performance indexes created successfully!\n');

    } catch (error) {
        console.error('❌ Error applying indexes:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

applyPerformanceIndexes()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
