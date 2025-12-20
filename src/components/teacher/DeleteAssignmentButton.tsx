'use client';

import { deleteAssignment } from "@/actions/assignments";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

export function DeleteAssignmentButton({ id, courseId }: { id: string, courseId: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => {
                if (confirm('Delete this assignment? Submissions will be lost.')) {
                    startTransition(async () => {
                        await deleteAssignment(id, courseId);
                    });
                }
            }}
            disabled={isPending}
            className="text-red-400 hover:text-red-600 p-2 disabled:opacity-50"
            title="Delete Assignment"
        >
            <Trash2 size={18} />
        </button>
    );
}
