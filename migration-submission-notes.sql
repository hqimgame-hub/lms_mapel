-- ========================================
-- SUBMISSION TEACHER TAG & NOTE MIGRATION
-- ========================================

ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "teacherTag" TEXT;
ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "teacherNote" TEXT;

-- Index for searching/filtering by teacherTag
CREATE INDEX IF NOT EXISTS "Submission_teacherTag_idx" ON "Submission"("teacherTag");
