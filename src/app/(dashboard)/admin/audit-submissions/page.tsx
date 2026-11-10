import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getMismatchedSubmissions } from "@/actions/audit-submissions";
import { AuditSubmissionsClient } from "@/components/admin/AuditSubmissionsClient";

export const dynamic = 'force-dynamic';

export default async function AdminAuditSubmissionsPage() {
    const session = await getSession();

    if (!session?.user || session.user.role !== 'ADMIN') {
        return redirect('/login');
    }

    const mismatchedSubmissions = await getMismatchedSubmissions();

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                    Audit &amp; Rekonsiliasi Submisi
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                    Pantau dan selesaikan submisi siswa yang tertinggal di kelas lama akibat perpindahan kelas siswa.
                </p>
            </div>

            <AuditSubmissionsClient initialData={mismatchedSubmissions} />
        </div>
    );
}
