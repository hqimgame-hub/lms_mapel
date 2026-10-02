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

const MAX_EXCEL_CELL_LENGTH = 32000;

/**
 * Menghasilkan file Excel (.xlsx) dari data backup — setiap tabel jadi 1 sheet.
 * Melakukan sanitasi otomatis agar teks tidak melampaui batas sel Excel (32.767 karakter).
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

        // Sanitasi baris data agar tidak melanggar batas 32.767 karakter per sel Excel
        const sanitizedRows = rows.map((row: any) => {
            const cleanRow: Record<string, any> = {};
            for (const [key, value] of Object.entries(row)) {
                if (value === null || value === undefined) {
                    cleanRow[key] = value;
                } else if (table === 'Submission' && key === 'tempFile' && typeof value === 'string' && value.length > 100) {
                    // Berkas draft Base64 siswa berukuran masif, ganti dengan ringkasan di Excel (tetap utuh di JSON)
                    cleanRow[key] = `[BERKAS_BASE64: ${value.length.toLocaleString('id-ID')} karakter - Tersimpan utuh di backup JSON]`;
                } else if (typeof value === 'string' && value.length > MAX_EXCEL_CELL_LENGTH) {
                    // Potong teks yang melebihi batas 32.767 karakter Excel secara aman
                    cleanRow[key] = value.slice(0, MAX_EXCEL_CELL_LENGTH) +
                        `... [DIPOTONG: Total ${value.length.toLocaleString('id-ID')} karakter - Lihat data lengkap di backup JSON]`;
                } else if (typeof value === 'object' && !(value instanceof Date)) {
                    // Jika ada objek bersarang, ubah ke string dan cek panjangnya
                    const jsonStr = JSON.stringify(value);
                    if (jsonStr.length > MAX_EXCEL_CELL_LENGTH) {
                        cleanRow[key] = jsonStr.slice(0, MAX_EXCEL_CELL_LENGTH) + '... [TRUNCATED]';
                    } else {
                        cleanRow[key] = jsonStr;
                    }
                } else {
                    cleanRow[key] = value;
                }
            }
            return cleanRow;
        });

        const ws = XLSX.utils.json_to_sheet(sanitizedRows);

        // Auto-width kolom berdasarkan isi data (dibatasi antara 10 - 50 agar sesuai spesifikasi Excel)
        const firstRow = sanitizedRows[0];
        const colWidths = Object.keys(firstRow).map((key) => {
            const maxContentLen = Math.max(
                key.length,
                ...sanitizedRows.slice(0, 100).map((r) => String(r[key] ?? '').length)
            );
            return {
                wch: Math.min(Math.max(maxContentLen, 10), 50)
            };
        });
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
 * Upload JSON + Excel ke Google Drive sekaligus secara aman dan andal
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

    // 1. Upload JSON (Format backup utama & utuh)
    const jsonFileName = `backup-lms-${dateStr}.json`;
    let jsonResult: { success: boolean; fileName: string; fileId?: string; viewUrl?: string; error?: string };
    try {
        const jsonBuffer = Buffer.from(JSON.stringify(backupData, null, 2), 'utf-8');
        const jsonUpload = await uploadToDrive(jsonBuffer, jsonFileName, 'application/json', backupFolderId || undefined);
        jsonResult = jsonUpload.error
            ? { success: false, fileName: jsonFileName, error: jsonUpload.error }
            : { success: true, fileName: jsonFileName, fileId: jsonUpload.id ?? undefined, viewUrl: jsonUpload.webViewLink ?? undefined };
    } catch (jsonErr: any) {
        console.error('[BACKUP JSON DRIVE ERROR]', jsonErr);
        jsonResult = { success: false, fileName: jsonFileName, error: jsonErr.message || 'Gagal mengunggah JSON ke Drive' };
    }

    // 2. Upload Excel (Format tabular untuk inspeksi / pelaporan)
    const xlsxFileName = `backup-lms-${dateStr}.xlsx`;
    let excelResult: { success: boolean; fileName: string; fileId?: string; viewUrl?: string; error?: string };
    try {
        const xlsxBuffer = generateExcelBackup(backupData);
        const xlsxUpload = await uploadToDrive(
            xlsxBuffer,
            xlsxFileName,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            backupFolderId || undefined
        );
        excelResult = xlsxUpload.error
            ? { success: false, fileName: xlsxFileName, error: xlsxUpload.error }
            : { success: true, fileName: xlsxFileName, fileId: xlsxUpload.id ?? undefined, viewUrl: xlsxUpload.webViewLink ?? undefined };
    } catch (excelErr: any) {
        console.error('[BACKUP EXCEL DRIVE ERROR]', excelErr);
        excelResult = { success: false, fileName: xlsxFileName, error: excelErr.message || 'Gagal memproses/mengunggah Excel ke Drive' };
    }

    return {
        json: jsonResult,
        excel: excelResult,
    };
}
