import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BackupClient } from "@/components/admin/BackupClient";
import { BACKUP_TABLES } from "@/lib/backup";

export const dynamic = 'force-dynamic';

export default async function AdminBackupPage() {
    const session = await getSession();

    if (!session?.user || session.user.role !== 'ADMIN') {
        return redirect('/login');
    }

    const client = prisma as any;
    const stats: Record<string, number> = {};
    let totalRecords = 0;

    for (const table of BACKUP_TABLES) {
        try {
            const modelName = table.charAt(0).toLowerCase() + table.slice(1);
            if (typeof client[modelName]?.count === 'function') {
                const count = await client[modelName].count();
                stats[table] = count;
                totalRecords += count;
            } else {
                stats[table] = 0;
            }
        } catch (e) {
            console.error(`Gagal menghitung baris tabel ${table}:`, e);
            stats[table] = 0;
        }
    }

    const hasGoogleDrive = Boolean(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
        process.env.GOOGLE_PRIVATE_KEY &&
        process.env.GOOGLE_DRIVE_FOLDER_ID
    );

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                    Pusat Cadangan Database (Backup)
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                    Kelola pencadangan otomatis harian ke Google Drive dan unduh arsip data sekolah kapan saja.
                </p>
            </div>

            <BackupClient
                stats={stats}
                totalRecords={totalRecords}
                hasGoogleDrive={hasGoogleDrive}
            />
        </div>
    );
}
