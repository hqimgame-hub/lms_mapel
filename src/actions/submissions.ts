'use server';

import { prisma } from "@/lib/prisma";
import { readdir, unlink } from "fs/promises";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { z } from "zod";
import { uploadToDrive, getOrCreateFolder } from "@/lib/drive";
import { join } from "path";

const SubmissionSchema = z.object({
    assignmentId: z.string(),
    content: z.string().optional(),
    fileUrl: z.string().optional().nullable(),
    fileName: z.string().optional().nullable(),
    action: z.enum(['DRAFT', 'SUBMIT']),
});

export async function saveSubmission(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'STUDENT') {
        return { message: "Unauthorized" };
    }

    const data = {
        assignmentId: formData.get('assignmentId'),
        content: formData.get('content'),
        fileUrl: formData.get('fileUrl'),
        fileName: formData.get('fileName'),
        action: formData.get('action'),
    };

    const validated = SubmissionSchema.safeParse(data);

    if (!validated.success) {
        return { message: "Invalid input", errors: validated.error.flatten().fieldErrors };
    }

    const { assignmentId, content, fileUrl, fileName, action } = validated.data;
    const studentId = session.user.id;

    try {
        // Check if already submitted finalized
        const existing = await prisma.submission.findUnique({
            where: {
                studentId_assignmentId: { studentId, assignmentId }
            }
        });

        if (existing?.status === 'SUBMITTED' || existing?.status === 'GRADED') {
            return { message: "Assignment already submitted. Cannot modify." };
        }

        const status = action === 'SUBMIT' ? 'SUBMITTED' : 'DRAFT';
        const submittedAt = action === 'SUBMIT' ? new Date() : null;

        // Logic for Link Submission
        let finalFileUrl = fileUrl !== undefined ? fileUrl : existing?.fileUrl;
        let finalFileName = fileName !== undefined ? fileName : existing?.fileName;

        // Ensure URL is valid if provided
        if (finalFileUrl && !finalFileUrl.startsWith('http')) {
            // Basic sanitation/validation could go here
        }

        await prisma.submission.upsert({
            where: {
                studentId_assignmentId: { studentId, assignmentId }
            },
            create: {
                studentId,
                assignmentId,
                content: content || '',
                fileUrl: finalFileUrl || null,
                fileName: finalFileName || null,
                status,
                submittedAt
            },
            update: {
                content: content || '',
                fileUrl: finalFileUrl,
                fileName: finalFileName,
                status,
                submittedAt: submittedAt || existing?.submittedAt
            }
        });

        revalidatePath(`/student/assignments/${assignmentId}`);
        revalidatePath(`/student/courses`);

        return {
            message: action === 'SUBMIT' ? "Assignment Submitted!" : "Draft Saved Successfully",
            success: true
        };

    } catch (e) {
        console.error(e);
        return { message: "Failed to save submission" };
    }
}
