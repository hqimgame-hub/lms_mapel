-- ========================================
-- STUDENT NOTE & TAG SYSTEM MIGRATION
-- ========================================

CREATE TABLE IF NOT EXISTS "StudentNote" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tag" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentNote_pkey" PRIMARY KEY ("id")
);

-- Unique constraint & indexes
CREATE UNIQUE INDEX IF NOT EXISTS "StudentNote_teacherId_studentId_key" ON "StudentNote"("teacherId", "studentId");
CREATE INDEX IF NOT EXISTS "StudentNote_teacherId_idx" ON "StudentNote"("teacherId");
CREATE INDEX IF NOT EXISTS "StudentNote_studentId_idx" ON "StudentNote"("studentId");

-- Foreign key constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'StudentNote_teacherId_fkey'
    ) THEN
        ALTER TABLE "StudentNote" ADD CONSTRAINT "StudentNote_teacherId_fkey" 
            FOREIGN KEY ("teacherId") REFERENCES "User"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'StudentNote_studentId_fkey'
    ) THEN
        ALTER TABLE "StudentNote" ADD CONSTRAINT "StudentNote_studentId_fkey" 
            FOREIGN KEY ("studentId") REFERENCES "User"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
