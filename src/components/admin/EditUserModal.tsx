'use client';

import { updateUser } from "@/actions/users";
import { useActionState, useState } from "react";
import { User, Edit, X } from "lucide-react";

interface EditUserModalProps {
    user: {
        id: string;
        name: string;
        username: string;
        email: string | null;
        role: string;
    };
}

export function EditUserModal({ user }: EditUserModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(updateUser, { success: false, message: '' });

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-blue-500 hover:text-blue-700"
                title="Edit Pengguna"
            >
                <Edit size={18} />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-primary p-4 text-white flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2">
                        <User size={20} />
                        Edit Pengguna
                    </h3>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <form action={async (formData) => {
                    await formAction(formData);
                    if (state?.success) {
                        setIsOpen(false);
                    }
                }} className="p-6 space-y-4">
                    <input type="hidden" name="id" value={user.id} />

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nama Lengkap</label>
                        <input
                            name="name"
                            defaultValue={user.name}
                            className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Username</label>
                        <input
                            name="username"
                            defaultValue={user.username}
                            className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Email (Opsional)</label>
                        <input
                            name="email"
                            defaultValue={user.email || ''}
                            type="email"
                            className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Password Baru (Biarkan kosong jika tidak ingin mengubah)</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Role / Peran</label>
                        <select
                            name="role"
                            defaultValue={user.role}
                            className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                        >
                            <option value="STUDENT">Siswa</option>
                            <option value="TEACHER">Guru</option>
                            <option value="ADMIN">Administrator</option>
                        </select>
                    </div>

                    {state?.message && (
                        <div className={`p-4 rounded-xl text-sm font-medium ${state.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {state.message}
                            {state.errors && Object.keys(state.errors).map(key => (
                                <p key={key} className="text-xs mt-1 font-normal">• {key}: {Array.isArray(state.errors[key]) ? state.errors[key].join(', ') : state.errors[key]}</p>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 px-4 py-2.5 rounded-xl border font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
