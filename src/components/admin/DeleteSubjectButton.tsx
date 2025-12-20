'use client';

import { deleteSubject } from "@/actions/subjects";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

export function DeleteSubjectButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => {
                if (confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) {
                    startTransition(async () => {
                        await deleteSubject(id);
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
