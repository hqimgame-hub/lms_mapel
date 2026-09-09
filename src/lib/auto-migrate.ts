import { prisma } from './prisma';

let isMigrated = false;

export async function ensureDbColumns() {
    if (isMigrated) return;
    try {
        // Run self-healing ALTER TABLE to ensure required columns exist in the database
        await prisma.$executeRawUnsafe(`ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "teacherTag" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "teacherNote" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Assignment" ADD COLUMN IF NOT EXISTS "enableDriveUpload" BOOLEAN NOT NULL DEFAULT false;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Assignment" ADD COLUMN IF NOT EXISTS "driveFolderUrl" TEXT;`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Submission_teacherTag_idx" ON "Submission"("teacherTag");`);
        isMigrated = true;
        console.log("Database self-healing columns migration verified successfully.");
    } catch (err) {
        console.error("ensureDbColumns auto-migration error:", err);
    }
}
