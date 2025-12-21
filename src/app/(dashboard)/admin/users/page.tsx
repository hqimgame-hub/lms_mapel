import { prisma } from "@/lib/prisma";
import { AddUserForm } from "@/components/admin/AddUserForm";
import { UserTable } from "@/components/admin/UserTable";
import { Users, UserCog, UserCircle } from "lucide-react";
import { getClasses } from "@/actions/classes";

export default async function AdminUsersPage({
    searchParams
}: {
    searchParams: Promise<{ tab?: string; page?: string; q?: string; classId?: string }>
}) {
    const { tab = 'staff', page = '1', q = '', classId = '' } = await searchParams;
    const itemsPerPage = 10;
    const currentPage = parseInt(page);
    const skip = (currentPage - 1) * itemsPerPage;

    // Determine roles for the active tab
    const roles = tab === 'students' ? ['STUDENT'] : ['ADMIN', 'TEACHER'];

    // Build the where clause
    const where: any = {
        role: { in: roles },
    };

    if (q) {
        where.OR = [
            { name: { contains: q, mode: 'insensitive' } },
            { username: { contains: q, mode: 'insensitive' } },
        ];
    }

    if (tab === 'students' && classId) {
        where.enrollments = {
            some: {
                classId: classId
            }
        };
    }

    // Fetch data, count, and classes in parallel
    const [users, totalCount, classes] = await Promise.all([
        prisma.user.findMany({
            where,
            include: {
                enrollments: {
                    include: {
                        class: true
                    }
                }
            },
            orderBy: { name: 'asc' },
            skip,
            take: itemsPerPage,
        }),
        prisma.user.count({ where }),
        getClasses()
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
                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Manajemen Akun</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Kelola hak akses dan data seluruh pengguna sistem.</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-[1.5rem] w-fit border border-slate-200 dark:border-slate-800 transition-colors">
                {tabs.map((t) => (
                    <a
                        key={t.id}
                        href={`/admin/users?tab=${t.id}`}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all ${tab === t.id
                            ? "bg-white dark:bg-slate-900 text-primary shadow-md shadow-primary/5 border border-primary/10 dark:border-primary/20"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/80"
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
                    <div className="max-w-4xl mx-auto w-full">
                        <AddUserForm classes={classes} />
                    </div>
                ) : (
                    <UserTable
                        users={users as any}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalCount={totalCount}
                        classes={classes}
                        showFilters={tab === 'students'}
                    />
                )}
            </div>
        </div>
    );
}
