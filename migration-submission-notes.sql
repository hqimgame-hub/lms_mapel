-- ============================================================
-- FULL SYNC MIGRATION - Jalankan di SQL Editor Supabase
-- ============================================================

-- 1. Tambah kolom baru di tabel Assignment (PENYEBAB ERROR UTAMA)
ALTER TABLE "Assignment" ADD COLUMN IF NOT EXISTS "enableDriveUpload" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Assignment" ADD COLUMN IF NOT EXISTS "driveFolderUrl" TEXT;

-- 2. Tambah kolom teacherTag dan teacherNote di Submission (jika belum ada)
ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "teacherTag" TEXT;
ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "teacherNote" TEXT;

-- 3. Hapus tabel StudentNote lama (jika masih ada)
DROP TABLE IF EXISTS "StudentNote";

-- 4. Fix TutorialTopic.updatedAt (hapus DEFAULT jika ada)
ALTER TABLE "TutorialTopic" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- 5. Index untuk teacherTag (opsional tapi bagus untuk performa)
CREATE INDEX IF NOT EXISTS "Submission_teacherTag_idx" ON "Submission"("teacherTag");

-- ============================================================
-- Selesai. Semua tabel sudah sinkron dengan Prisma schema.
-- ============================================================
