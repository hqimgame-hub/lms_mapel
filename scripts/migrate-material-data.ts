import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateData() {
    console.log('Starting data migration...');

    try {
        // Get all existing materials with old structure
        const materials = await prisma.$queryRaw`
      SELECT id, type, content FROM "Material"
    `;

        console.log(`Found ${(materials as any[]).length} materials to migrate`);

        // For each material, create a MaterialContent record
        for (const material of materials as any[]) {
            if (material.type && material.content) {
                await prisma.$executeRaw`
          INSERT INTO "MaterialContent" (id, type, content, "order", "createdAt", "materialId")
          VALUES (
            gen_random_uuid()::text,
            ${material.type},
            ${material.content},
            0,
            NOW(),
            ${material.id}
          )
        `;
                console.log(`Migrated material ${material.id}`);
            }
        }

        console.log('Data migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

migrateData();
