import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backupMaterialData() {
    console.log('Backing up material data...');

    try {
        const materials = await prisma.$queryRaw`
      SELECT id, title, description, type, content, "createdAt", "courseId" 
      FROM "Material"
    `;

        console.log('Backup data:', JSON.stringify(materials, null, 2));

        // Save to file
        const fs = require('fs');
        fs.writeFileSync(
            'd:/lms_mapel/scripts/material-backup.json',
            JSON.stringify(materials, null, 2)
        );

        console.log('Backup saved to material-backup.json');
    } catch (error) {
        console.error('Backup failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

backupMaterialData();
