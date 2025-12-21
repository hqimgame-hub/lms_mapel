import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyMigration() {
    console.log('🔍 Verifying production database state...\n');

    try {
        // Check Material table structure
        console.log('Checking Material table...');
        const materials = await prisma.material.findMany({
            include: {
                contents: true
            },
            take: 5
        });
        console.log(`✅ Found ${materials.length} materials`);
        console.log(`✅ Materials have 'contents' relation working!\n`);

        // Check MaterialContent table
        console.log('Checking MaterialContent table...');
        const contentCount = await prisma.materialContent.count();
        console.log(`✅ Found ${contentCount} content items\n`);

        // Show sample data
        if (materials.length > 0) {
            console.log('Sample material with contents:');
            materials.forEach(m => {
                console.log(`  - ${m.title}: ${m.contents.length} content item(s)`);
            });
        }

        console.log('\n🎉 Database migration is COMPLETE and VERIFIED!');
        console.log('\nNext step: Trigger redeploy on Vercel');
        console.log('The application should work without errors now.');

    } catch (error) {
        console.error('❌ Verification failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

verifyMigration();
