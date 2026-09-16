import { prisma } from '@/lib/prisma';
import { uploadToDrive, getOrCreateFolder } from '@/lib/drive';

export const BACKUP_TABLES = [
    'User',
    'Subject',
    'Class',
    'Course',
    'Enrollment',
    'Material',
    'MaterialContent',
    'Exam',
    'Assignment',
    'Submission',
    'TutorialTopic',
    'TutorialItem'
] as const;

export type BackupResult = {
    meta: {
        timestamp: string;
        generatedAt: string;
        environment: string;
        tableCount: number;
        totalRecords: number;
        stats: Record<string, number>;
    };
    [table: string]: any;
};

/**
 * Mengambil seluruh data dari semua tabel database
 */
export async function generateDatabaseBackup(): Promise<BackupResult> {
    const client = prisma as any;
    const backupData: Record<string, any[]> = {};
    const stats: Record<string, number> = {};
    let totalRecords = 0;

    for (const table of BACKUP_TABLES) {
        try {
            const modelName = table.charAt(0).toLowerCase() + table.slice(1);
            if (typeof client[modelName]?.findMany === 'function') {
                const rows = await client[modelName].findMany();
                backupData[table] = rows;
                stats[table] = rows.length;
                totalRecords += rows.length;
            } else {
                backupData[table] = [];
                stats[table] = 0;
            }
        } catch (error) {
            console.error(`[BACKUP ERROR] Gagal mengekspor tabel ${table}:`, error);
            backupData[table] = [];
            stats[table] = 0;
        }
    }

    const now = new Date();
    const result: BackupResult = {
        meta: {
            timestamp: now.toISOString(),
            generatedAt: now.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
            environment: process.env.NODE_ENV || 'production',
            tableCount: BACKUP_TABLES.length,
            totalRecords,
            stats
        },
        ...backupData
    };

    return result;
}

/**
 * Menyimpan data backup ke Google Drive di folder Backup_LMS
 */
export async function uploadBackupToGoogleDrive(backupData: BackupResult): Promise<{
    success: boolean;
    fileName: string;
    fileId?: string;
    viewUrl?: string;
    error?: string;
}> {
    try {
        const now = new Date();
        const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const fileName = `backup-lms-${dateStr}.json`;

        const jsonBuffer = Buffer.from(JSON.stringify(backupData, null, 2), 'utf-8');

        // Dapatkan atau buat folder Backup_LMS di Google Drive
        let backupFolderId = await getOrCreateFolder('Backup_LMS');

        // Jika gagal membuat subfolder khusus, gunakan folder root default
        if (!backupFolderId) {
            backupFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim() || null;
        }

        const uploadRes = await uploadToDrive(
            jsonBuffer,
            fileName,
            'application/json',
            backupFolderId || undefined
        );

        if (uploadRes.error || !uploadRes.id) {
            return {
                success: false,
                fileName,
                error: uploadRes.error || 'Gagal mengunggah file backup ke Google Drive'
            };
        }

        return {
            success: true,
            fileName,
            fileId: uploadRes.id,
            viewUrl: uploadRes.webViewLink || undefined
        };
    } catch (err: any) {
        console.error('[BACKUP DRIVE ERROR]', err);
        return {
            success: false,
            fileName: 'backup-lms.json',
            error: err.message || 'Terjadi kesalahan sistem saat unggah ke Drive'
        };
    }
}
