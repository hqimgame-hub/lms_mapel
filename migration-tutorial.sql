-- ========================================
-- TUTORIAL & STUDENT GUIDE SYSTEM MIGRATION
-- ========================================

-- STEP 1: Create TutorialTopic table
CREATE TABLE IF NOT EXISTS "TutorialTopic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "placement" TEXT NOT NULL DEFAULT 'BOTH',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorialTopic_pkey" PRIMARY KEY ("id")
);

-- STEP 2: Create TutorialItem table
CREATE TABLE IF NOT EXISTS "TutorialItem" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'YOUTUBE',
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorialItem_pkey" PRIMARY KEY ("id")
);

-- STEP 3: Create Indexes
CREATE INDEX IF NOT EXISTS "TutorialTopic_isActive_placement_idx" ON "TutorialTopic"("isActive", "placement");
CREATE INDEX IF NOT EXISTS "TutorialItem_topicId_idx" ON "TutorialItem"("topicId");

-- STEP 4: Add Foreign Key Constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TutorialItem_topicId_fkey'
    ) THEN
        ALTER TABLE "TutorialItem" ADD CONSTRAINT "TutorialItem_topicId_fkey" 
            FOREIGN KEY ("topicId") REFERENCES "TutorialTopic"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
