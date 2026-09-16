import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateDatabaseBackup } from '@/lib/backup';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized: Hanya Admin yang dapat mengunduh backup' }, { status: 401 });
    }

    try {
        const backupData = await generateDatabaseBackup();
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);
        const fileName = `backup-lms-${dateStr}.json`;

        const jsonString = JSON.stringify(backupData, null, 2);

        return new NextResponse(jsonString, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Cache-Control': 'no-store, max-age=0'
            }
        });
    } catch (err: any) {
        console.error('[ADMIN BACKUP DOWNLOAD ERROR]', err);
        return NextResponse.json({ error: err.message || 'Gagal membuat file backup' }, { status: 500 });
    }
}
