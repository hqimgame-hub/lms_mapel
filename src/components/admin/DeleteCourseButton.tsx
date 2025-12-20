'use client';

import { deleteCourse } from "@/actions/courses";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

export function DeleteCourseButton({ courseId }: { courseId: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            title="Hapus Alokasi"
            onClick={() => {
                if (confirm('Apakah Anda yakin ingin menghapus alokasi kursus ini?')) {
                    startTransition(async () => {
                        await deleteCourse(courseId);
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
