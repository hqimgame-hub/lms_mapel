import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateDatabaseBackup, uploadBackupToGoogleDrive } from '@/lib/backup';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max execution time for backup

async function verifyAuthorized(req: NextRequest): Promise<boolean> {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // 1. Check Bearer token from Vercel Cron or custom script
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
        return true;
    }

    // 2. Check Vercel Cron Header if CRON_SECRET is not configured
    if (!cronSecret && req.headers.get('x-vercel-cron') === '1') {
        return true;
    }

    // 3. Check Admin session
    try {
        const session = await auth();
        if (session?.user?.role === 'ADMIN') {
            return true;
        }
    } catch (e) {
        console.warn('Could not verify session in cron route:', e);
    }

    return false;
}

export async function GET(req: NextRequest) {
    const isAuthorized = await verifyAuthorized(req);
    if (!isAuthorized) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized: Akses ditolak' },
            { status: 401 }
        );
    }

    try {
        console.log('[CRON BACKUP] Memulai proses backup database...');
        const backupData = await generateDatabaseBackup();

        console.log(`[CRON BACKUP] Data siap (${backupData.meta.totalRecords} records). Mengunggah ke Google Drive...`);
        const uploadResult = await uploadBackupToGoogleDrive(backupData);

        if (!uploadResult.success) {
            console.error('[CRON BACKUP FAILED]', uploadResult.error);
            return NextResponse.json({
                success: false,
                error: uploadResult.error,
                stats: backupData.meta.stats
            }, { status: 500 });
        }

        console.log(`[CRON BACKUP SUCCESS] File ${uploadResult.fileName} tersimpan di Drive.`);
        return NextResponse.json({
            success: true,
            message: 'Backup database berhasil diekspor dan diunggah ke Google Drive.',
            fileName: uploadResult.fileName,
            viewUrl: uploadResult.viewUrl,
            totalRecords: backupData.meta.totalRecords,
            stats: backupData.meta.stats,
            generatedAt: backupData.meta.generatedAt
        });

    } catch (err: any) {
        console.error('[CRON BACKUP FATAL ERROR]', err);
        return NextResponse.json({
            success: false,
            error: err.message || 'Internal Server Error'
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    return GET(req);
}
