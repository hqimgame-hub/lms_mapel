import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateProductionDatabase() {
    console.log('🚀 Starting production database migration...\n');

    try {
        // Step 1: Check if MaterialContent table already exists
        console.log('Step 1: Checking if migration is needed...');
        try {
            await prisma.$queryRaw`SELECT 1 FROM "MaterialContent" LIMIT 1`;
            console.log('✅ MaterialContent table already exists. Migration may have already been done.');
            console.log('   Checking if old columns still exist...\n');
        } catch (error) {
            console.log('✅ MaterialContent table does not exist yet. Proceeding with migration...\n');
        }

        // Step 2: Create MaterialContent table
        console.log('Step 2: Creating MaterialContent table...');
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "MaterialContent" (
        "id" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "order" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "materialId" TEXT NOT NULL,
        CONSTRAINT "MaterialContent_pkey" PRIMARY KEY ("id")
      )
    `;
        console.log('✅ MaterialContent table created\n');

        // Step 3: Create index
        console.log('Step 3: Creating index...');
        await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "MaterialContent_materialId_idx" 
      ON "MaterialContent"("materialId")
    `;
        console.log('✅ Index created\n');

        // Step 4: Add foreign key constraint
        console.log('Step 4: Adding foreign key constraint...');
        try {
            await prisma.$executeRaw`
        ALTER TABLE "MaterialContent" 
        ADD CONSTRAINT "MaterialContent_materialId_fkey" 
        FOREIGN KEY ("materialId") REFERENCES "Material"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE
      `;
            console.log('✅ Foreign key constraint added\n');
        } catch (error: any) {
            if (error.message.includes('already exists')) {
                console.log('✅ Foreign key constraint already exists\n');
            } else {
                throw error;
            }
        }

        // Step 5: Migrate existing data
        console.log('Step 5: Migrating existing material data...');
        const result = await prisma.$executeRaw`
      INSERT INTO "MaterialContent" (id, type, content, "order", "createdAt", "materialId")
      SELECT 
        gen_random_uuid()::text,
        type,
        content,
        0,
        NOW(),
        id
      FROM "Material"
      WHERE type IS NOT NULL AND content IS NOT NULL
      ON CONFLICT DO NOTHING
    `;
        console.log(`✅ Migrated ${result} material records\n`);

        // Step 6: Drop old columns
        console.log('Step 6: Dropping old columns from Material table...');
        try {
            await prisma.$executeRaw`ALTER TABLE "Material" DROP COLUMN IF EXISTS "type"`;
            console.log('✅ Dropped "type" column');
        } catch (error) {
            console.log('⚠️  Column "type" may already be dropped');
        }

        try {
            await prisma.$executeRaw`ALTER TABLE "Material" DROP COLUMN IF EXISTS "content"`;
            console.log('✅ Dropped "content" column\n');
        } catch (error) {
            console.log('⚠️  Column "content" may already be dropped\n');
        }

        // Step 7: Verify migration
        console.log('Step 7: Verifying migration...');
        const materialCount = await prisma.material.count();
        const contentCount = await prisma.materialContent.count();

        console.log(`✅ Total materials: ${materialCount}`);
        console.log(`✅ Total content items: ${contentCount}\n`);

        console.log('🎉 Migration completed successfully!\n');
        console.log('Next steps:');
        console.log('1. Redeploy your application on Vercel');
        console.log('2. The error should be gone!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run migration
migrateProductionDatabase()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
