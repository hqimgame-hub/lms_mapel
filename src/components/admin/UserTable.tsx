'use client';

import { useState, useTransition } from "react";
import { deleteUsersBulk } from "@/actions/users";
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
        class: {
            name: string;
        }
    }[];
}

interface UserTableProps {
    users: User[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
    classes: { id: string, name: string }[];
    showFilters?: boolean;
}

export function UserTable({ users, currentPage, totalPages, totalCount, classes, showFilters }: UserTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState("");

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

                {showFilters && (
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <select
                                onChange={(e) => handleFilterClass(e.target.value)}
                                className="pl-11 pr-10 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-bold text-slate-700 dark:text-slate-300 appearance-none min-w-[160px]"
                                defaultValue={window.location.search.includes('classId=') ? new URLSearchParams(window.location.search).get('classId') || '' : ''}
                            >
                                <option value="">Semua Kelas</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Table Actions */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                        {selectedIds.length === users.length && users.length > 0 ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} />}
                        {selectedIds.length > 0 ? `${selectedIds.length} Terpilih` : 'Pilih Semua'}
                    </button>

                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            disabled={isPending}
                            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all disabled:opacity-50"
                        >
                            <Trash2 size={16} />
                            Hapus Masal
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
                                <th className="p-6">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary dark:bg-slate-800"
                                        checked={selectedIds.length === users.length && users.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Pengguna</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Peran</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Kelas</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="p-6">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary dark:bg-slate-800"
                                            checked={selectedIds.includes(user.id)}
                                            onChange={() => toggleSelect(user.id)}
                                        />
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <td className="p-6">
                                                <p className="text-xs font-black text-primary">
                                                    {user.enrollments?.[0]?.class?.name || '-'}
                                                </p>
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                                                    user.role === 'TEACHER' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                        'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <EditUserModal user={user} />
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
                            <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
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
                                        className="p-2 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-primary disabled:opacity-50 transition-all shadow-sm"
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
                                        className="p-2 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-primary disabled:opacity-50 transition-all shadow-sm"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                </div>
            </div>
            );
}
