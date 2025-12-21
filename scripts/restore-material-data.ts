import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function restoreMaterialData() {
    console.log('Restoring material data...');

    try {
        // Read backup file
        const backupData = JSON.parse(
            fs.readFileSync('d:/lms_mapel/scripts/material-backup.json', 'utf-8')
        );

        console.log(`Found ${backupData.length} materials to restore`);

        // For each backed up material, create MaterialContent
        for (const material of backupData) {
            if (material.type && material.content) {
                await prisma.materialContent.create({
                    data: {
                        type: material.type,
                        content: material.content,
                        order: 0,
                        materialId: material.id
                    }
                });
                console.log(`Restored material ${material.id}`);
            }
        }

        console.log('Data restoration completed successfully!');
    } catch (error) {
        console.error('Restoration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

restoreMaterialData();
