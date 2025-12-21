-- ========================================
-- PRODUCTION DATABASE MIGRATION
-- Multi-Content Material System
-- ========================================

-- STEP 1: Backup existing data (OPTIONAL - just view the data)
-- Run this first to see what data you have
SELECT id, title, description, type, content, "createdAt", "courseId" 
FROM "Material";

-- ========================================
-- STEP 2: Create MaterialContent table
-- ========================================
CREATE TABLE "MaterialContent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "materialId" TEXT NOT NULL,

    CONSTRAINT "MaterialContent_pkey" PRIMARY KEY ("id")
);

-- Create index for better performance
CREATE INDEX "MaterialContent_materialId_idx" ON "MaterialContent"("materialId");

-- Add foreign key constraint
ALTER TABLE "MaterialContent" ADD CONSTRAINT "MaterialContent_materialId_fkey" 
    FOREIGN KEY ("materialId") REFERENCES "Material"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ========================================
-- STEP 3: Migrate existing data
-- ========================================
INSERT INTO "MaterialContent" (id, type, content, "order", "createdAt", "materialId")
SELECT 
    gen_random_uuid()::text,
    type,
    content,
    0,
    NOW(),
    id
FROM "Material"
WHERE type IS NOT NULL AND content IS NOT NULL;

-- ========================================
-- STEP 4: Drop old columns from Material
-- ========================================
ALTER TABLE "Material" DROP COLUMN IF EXISTS "type";
ALTER TABLE "Material" DROP COLUMN IF EXISTS "content";

-- ========================================
-- STEP 5: Verify migration success
-- ========================================
-- Check materials count
SELECT COUNT(*) as total_materials FROM "Material";

-- Check content items count
SELECT COUNT(*) as total_content_items FROM "MaterialContent";

-- Check the relation works
SELECT 
    m.title as material_title, 
    mc.type as content_type, 
    LEFT(mc.content, 50) as content_preview
FROM "Material" m 
JOIN "MaterialContent" mc ON m.id = mc."materialId" 
LIMIT 10;

-- ========================================
-- MIGRATION COMPLETE!
-- ========================================
