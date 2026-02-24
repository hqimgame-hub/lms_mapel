import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getTeacherStudents } from "@/actions/users";
import { TeacherStudentsClient } from "@/components/teacher/TeacherStudentsClient";
import { Users } from "lucide-react";
import { redirect } from "next/navigation";

export default async function TeacherStudentsPage() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'TEACHER') redirect('/dashboard');

    const teacherId = session.user.id;
    const classes = await getTeacherStudents(teacherId);

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Data Siswa</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                    Lihat dan kelola akun siswa di kelas Anda. Anda dapat mereset password siswa yang lupa.
                </p>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-300">
                <Users size={18} className="flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                    <p className="font-bold">Hanya siswa di kelas Anda yang ditampilkan.</p>
                    <p className="font-medium opacity-80 mt-0.5">
                        Anda dapat mengubah nama, email, dan mereset password siswa tanpa perlu menghubungi admin.
                    </p>
                </div>
            </div>

            <TeacherStudentsClient classes={classes} />
        </div>
    );
}
