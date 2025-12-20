'use client';

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
    id: string;
    courseId: string;
    onDelete: (id: string, courseId: string) => Promise<{ message: string, success?: boolean }>;
    className?: string;
}

export function DeleteButton({ id, courseId, onDelete, className }: DeleteButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        if (!confirm("Apakah Anda yakin ingin menghapus item ini?")) return;

        startTransition(async () => {
            const result = await onDelete(id, courseId);
            alert(result.message);
        });
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className={`p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50 ${className}`}
            title="Hapus"
        >
            <Trash2 size={18} />
        </button>
    );
}
