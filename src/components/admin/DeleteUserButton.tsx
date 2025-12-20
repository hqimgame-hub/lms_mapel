'use client';

import { deleteUser } from "@/actions/users";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

export function DeleteUserButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => {
                if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
                    startTransition(async () => {
                        await deleteUser(id);
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
