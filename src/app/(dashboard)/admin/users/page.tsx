import { prisma } from "@/lib/prisma";
import { AddUserForm } from "@/components/admin/AddUserForm";
import { UserTable } from "@/components/admin/UserTable";
import { Users, UserCog, UserCircle } from "lucide-react";

export default async function AdminUsersPage({
    searchParams
}: {
    searchParams: Promise<{ tab?: string; page?: string }>
}) {
    const { tab = 'staff', page = '1' } = await searchParams;
    const itemsPerPage = 10;
    const currentPage = parseInt(page);
    const skip = (currentPage - 1) * itemsPerPage;

    // Determine roles for the active tab
    const roles = tab === 'students' ? ['STUDENT'] : ['ADMIN', 'TEACHER'];

    // Fetch data, count, and classes in parallel
    const [users, totalCount, classes] = await Promise.all([
        prisma.user.findMany({
            where: { role: { in: roles } },
            orderBy: { name: 'asc' },
            skip,
            take: itemsPerPage,
        }),
        prisma.user.count({
            where: { role: { in: roles } }
        }),
        prisma.class.findMany({ orderBy: { name: 'asc' } })
    ]);

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const tabs = [
        { id: 'students', label: 'Daftar Siswa', icon: <Users size={18} /> },
        { id: 'staff', label: 'Guru & Admin', icon: <UserCog size={18} /> },
        { id: 'add', label: 'Tambah Pengguna', icon: <UserCircle size={18} /> },
    ];

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Manajemen Akun 🛡️</h1>
                <p className="text-slate-500 font-medium">Kelola hak akses dan data seluruh pengguna sistem.</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-[1.5rem] w-fit">
                {tabs.map((t) => (
                    <a
                        key={t.id}
                        href={`/admin/users?tab=${t.id}`}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${tab === t.id
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                            }`}
                    >
                        {t.icon}
                        {t.label}
                    </a>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-2">
                {tab === 'add' ? (
                    <div className="max-w-2xl mx-auto">
                        <AddUserForm classes={classes} />
                    </div>
                ) : (
                    <UserTable
                        users={users}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalCount={totalCount}
                    />
                )}
            </div>
        </div>
    );
}
