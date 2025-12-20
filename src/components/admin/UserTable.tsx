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
import { EditUserModal } from "./EditUserModal";
import { DeleteUserButton } from "./DeleteUserButton";

interface User {
    id: string;
    name: string;
    username: string;
    email: string | null;
    role: string;
}

interface UserTableProps {
    users: User[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
}

export function UserTable({ users, currentPage, totalPages, totalCount }: UserTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();

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

    return (
        <div className="flex flex-col gap-4">
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
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-6 w-10"></th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Identitas</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Kontak</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Peran</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map((user) => (
                                <tr key={user.id} className={`hover:bg-slate-50/50 transition-colors ${selectedIds.includes(user.id) ? 'bg-primary/5' : ''}`}>
                                    <td className="p-6">
                                        <button onClick={() => toggleSelect(user.id)}>
                                            {selectedIds.includes(user.id) ? <CheckSquare size={20} className="text-primary" /> : <Square size={20} className="text-slate-200" />}
                                        </button>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                                                <p className="text-[10px] font-mono text-slate-400">{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-xs font-medium text-slate-600">{user.email || '-'}</p>
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
                                    <td colSpan={5} className="py-20 text-center text-slate-400 font-bold">
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
