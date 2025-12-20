'use client';

import { deleteClass } from "@/actions/classes";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

export function DeleteClassButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => {
                if (confirm('Apakah Anda yakin ingin menghapus kelas ini? Semua pendaftaran siswa juga akan dihapus.')) {
                    startTransition(async () => {
                        await deleteClass(id);
                    });
                }
            }}
            disabled={isPending}
            className="text-red-500 hover:text-red-700 disabled:opacity-50"
        >
            <Trash2 size={18} />
        </button>
    );
}
