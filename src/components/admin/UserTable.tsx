'use client';

import { useState, useTransition } from "react";
import { deleteUsersBulk, deleteAllStudents } from "@/actions/users";
import {
    Trash2,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    User,
    CheckSquare,
    Square
} from "lucide-react";
import { Search, Filter, X } from "lucide-react";
import { EditUserModal } from "./EditUserModal";
import { DeleteUserButton } from "./DeleteUserButton";

interface User {
    id: string;
    name: string;
    username: string;
    email: string | null;
    role: string;
    enrollments?: {
        classId?: string;
        class?: {
            id?: string;
            name: string;
        };
    }[];
}

interface UserTableProps {
    users: User[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
    classes: { id: string, name: string }[];
    showFilters?: boolean;
    limit: number;
}

export function UserTable({ users, currentPage, totalPages, totalCount, classes, showFilters, limit }: UserTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState("");
    const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
    const [confirmPhrase, setConfirmPhrase] = useState("");

    const toggleSelectAll = () => {
        if (selectedIds.length === users.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(users.map(u => u.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} pengguna terpilih?`)) return;

        startTransition(async () => {
            const result = await deleteUsersBulk(selectedIds);
            if (result.success) {
                setSelectedIds([]);
                alert(result.message);
            } else {
                alert(result.message);
            }
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const url = new URL(window.location.href);
        if (searchTerm) url.searchParams.set('q', searchTerm);
        else url.searchParams.delete('q');
        url.searchParams.set('page', '1');
        window.location.href = url.toString();
    };

    const handleFilterClass = (classId: string) => {
        const url = new URL(window.location.href);
        if (classId) url.searchParams.set('classId', classId);
        else url.searchParams.delete('classId');
        url.searchParams.set('page', '1');
        window.location.href = url.toString();
    };

    const handleLimitChange = (newLimit: string) => {
        const url = new URL(window.location.href);
        url.searchParams.set('limit', newLimit);
        url.searchParams.set('page', '1');
        window.location.href = url.toString();
    };

    const handleDeleteAllStudents = async () => {
        if (confirmPhrase !== "HAPUS SEMUA SISWA") return;
        
        setIsDeleteAllModalOpen(false);
        setConfirmPhrase("");

        startTransition(async () => {
            const result = await deleteAllStudents();
            if (result.success) {
                setSelectedIds([]);
                alert(result.message);
            } else {
                alert(result.message);
            }
        });
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-2">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Cari nama atau email..."
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-medium dark:text-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>

                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                        <select
                            value={limit.toString()}
                            onChange={(e) => handleLimitChange(e.target.value)}
                            className="pl-4 pr-10 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-bold text-slate-700 dark:text-slate-300 min-w-[120px]"
                        >
                            <option value="10">10 per hal</option>
                            <option value="25">25 per hal</option>
                            <option value="50">50 per hal</option>
                            <option value="100">100 per hal</option>
                            <option value="250">250 per hal</option>
                        </select>
                    </div>

                    {showFilters && (
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <select
                                onChange={(e) => handleFilterClass(e.target.value)}
                                className="pl-11 pr-10 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-bold text-slate-700 dark:text-slate-300 appearance-none min-w-[160px]"
                                defaultValue={typeof window !== 'undefined' && window.location.search.includes('classId=') ? new URLSearchParams(window.location.search).get('classId') || '' : ''}
                            >
                                <option value="">Semua Kelas</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Table Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                <div className="flex items-center gap-4 flex-wrap">
                    <button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                        {selectedIds.length === users.length && users.length > 0 ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} />}
                        {selectedIds.length > 0 ? `${selectedIds.length} Terpilih` : 'Pilih Semua'}
                    </button>

                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            disabled={isPending}
                            className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-500/20 transition-all disabled:opacity-50"
                        >
                            <Trash2 size={16} />
                            Hapus Masal
                        </button>
                    )}

                    {showFilters && (
                        <button
                            onClick={() => setIsDeleteAllModalOpen(true)}
                            disabled={isPending}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-md shadow-red-500/10"
                        >
                            <Trash2 size={16} />
                            Hapus Semua Siswa
                        </button>
                    )}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Total: {totalCount} Pengguna
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="p-6"></th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Identitas</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Kontak</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Kelas</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Peran</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {users.map((user) => (
                                <tr key={user.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${selectedIds.includes(user.id) ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                                    <td className="p-6">
                                        <button onClick={() => toggleSelect(user.id)}>
                                            {selectedIds.includes(user.id) ? <CheckSquare size={20} className="text-primary" /> : <Square size={20} className="text-slate-200 dark:text-slate-700" />}
                                        </button>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{user.name}</p>
                                                <p className="text-[10px] font-mono text-slate-400">{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{user.email || '-'}</p>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-xs font-black text-primary">
                                            {user.enrollments?.[0]?.class?.name || '-'}
                                        </p>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${user.role === 'ADMIN' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800' :
                                            user.role === 'TEACHER' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800' :
                                                'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <EditUserModal user={user} classes={classes} />
                                            <DeleteUserButton id={user.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-slate-400 font-bold">
                                        Tidak ada data ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 flex justify-between items-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Halaman {currentPage} dari {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage <= 1}
                                onClick={() => {
                                    const url = new URL(window.location.href);
                                    url.searchParams.set('page', (currentPage - 1).toString());
                                    window.location.href = url.toString();
                                }}
                                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-primary disabled:opacity-50 transition-all shadow-sm"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                disabled={currentPage >= totalPages}
                                onClick={() => {
                                    const url = new URL(window.location.href);
                                    url.searchParams.set('page', (currentPage + 1).toString());
                                    window.location.href = url.toString();
                                }}
                                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-primary disabled:opacity-50 transition-all shadow-sm"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Konfirmasi Pengamanan Ganda Hapus Semua Siswa */}
            {isDeleteAllModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 max-w-md w-full mx-4 shadow-2xl flex flex-col gap-6 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                                <Trash2 className="text-red-600 animate-bounce" size={24} />
                                Konfirmasi Penghapusan
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                Tindakan ini bersifat **DESTRUKTIF**. Seluruh akun siswa, pendaftaran kelas, dan jawaban tugas mereka akan dihapus **permanen** dari database.
                            </p>
                        </div>

                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-4 rounded-2xl text-xs text-red-600 dark:text-red-400 font-semibold leading-relaxed">
                            PENTING: Pastikan Anda telah melakukan backup database terlebih dahulu menggunakan script `scripts/backup-db.ts` sebelum melanjutkan.
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                Ketik <span className="text-red-600 font-black">"HAPUS SEMUA SISWA"</span> untuk konfirmasi:
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-red-500/5 focus:border-red-500 outline-none transition-all text-sm font-bold dark:text-white"
                                placeholder="HAPUS SEMUA SISWA"
                                value={confirmPhrase}
                                onChange={(e) => setConfirmPhrase(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteAllModalOpen(false);
                                    setConfirmPhrase("");
                                }}
                                className="px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDeleteAllStudents}
                                disabled={confirmPhrase !== "HAPUS SEMUA SISWA" || isPending}
                                className="px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:hover:bg-red-600 transition-all shadow-md shadow-red-500/10"
                            >
                                Ya, Hapus Semua
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
