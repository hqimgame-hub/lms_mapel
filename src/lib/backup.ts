import { prisma } from '@/lib/prisma';
import { uploadToDrive, getOrCreateFolder } from '@/lib/drive';
import * as XLSX from 'xlsx';

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

/**
 * Menghasilkan file Excel (.xlsx) dari data backup — setiap tabel jadi 1 sheet
 */
export function generateExcelBackup(backupData: BackupResult): Buffer {
    const wb = XLSX.utils.book_new();

    for (const table of BACKUP_TABLES) {
        const rows = backupData[table as string];
        if (!Array.isArray(rows) || rows.length === 0) {
            // Tetap buat sheet kosong agar semua tabel terlihat
            const ws = XLSX.utils.aoa_to_sheet([['(Tidak ada data)']]);
            XLSX.utils.book_append_sheet(wb, ws, table);
            continue;
        }

        const ws = XLSX.utils.json_to_sheet(rows);

        // Auto-width kolom berdasarkan isi data
        const colWidths = Object.keys(rows[0]).map((key) => ({
            wch: Math.max(
                key.length,
                ...rows.slice(0, 100).map((r) => String(r[key] ?? '').length)
            )
        }));
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, table);
    }

    // Sheet pertama: Ringkasan / Meta
    const metaRows = [
        ['Keterangan', 'Nilai'],
        ['Waktu Backup', backupData.meta.generatedAt],
        ['Environment', backupData.meta.environment],
        ['Jumlah Tabel', backupData.meta.tableCount],
        ['Total Record', backupData.meta.totalRecords],
        [],
        ['Tabel', 'Jumlah Record'],
        ...Object.entries(backupData.meta.stats).map(([t, c]) => [t, c])
    ];
    const metaWs = XLSX.utils.aoa_to_sheet(metaRows);
    metaWs['!cols'] = [{ wch: 20 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, metaWs, 'Ringkasan');

    // Pindahkan sheet Ringkasan ke posisi pertama
    const sheetNames = wb.SheetNames;
    const ringkasanIdx = sheetNames.indexOf('Ringkasan');
    if (ringkasanIdx > 0) {
        sheetNames.splice(ringkasanIdx, 1);
        sheetNames.unshift('Ringkasan');
    }

    return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
}

/**
 * Upload JSON + Excel ke Google Drive sekaligus
 */
export async function uploadBothBackupsToGoogleDrive(backupData: BackupResult): Promise<{
    json: { success: boolean; fileName: string; fileId?: string; viewUrl?: string; error?: string };
    excel: { success: boolean; fileName: string; fileId?: string; viewUrl?: string; error?: string };
}> {
    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);

    let backupFolderId = await getOrCreateFolder('Backup_LMS');
    if (!backupFolderId) {
        backupFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim() || null;
    }

    // Upload JSON
    const jsonFileName = `backup-lms-${dateStr}.json`;
    const jsonBuffer = Buffer.from(JSON.stringify(backupData, null, 2), 'utf-8');
    const jsonUpload = await uploadToDrive(jsonBuffer, jsonFileName, 'application/json', backupFolderId || undefined);

    // Upload Excel
    const xlsxFileName = `backup-lms-${dateStr}.xlsx`;
    const xlsxBuffer = generateExcelBackup(backupData);
    const xlsxUpload = await uploadToDrive(
        xlsxBuffer,
        xlsxFileName,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        backupFolderId || undefined
    );

    return {
        json: jsonUpload.error
            ? { success: false, fileName: jsonFileName, error: jsonUpload.error }
            : { success: true, fileName: jsonFileName, fileId: jsonUpload.id ?? undefined, viewUrl: jsonUpload.webViewLink ?? undefined },
        excel: xlsxUpload.error
            ? { success: false, fileName: xlsxFileName, error: xlsxUpload.error }
            : { success: true, fileName: xlsxFileName, fileId: xlsxUpload.id ?? undefined, viewUrl: xlsxUpload.webViewLink ?? undefined },
    };
}
