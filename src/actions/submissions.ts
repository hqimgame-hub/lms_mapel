'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { z } from "zod";

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

    // Handle Backup File Upload
    const backupFile = formData.get('backupFile') as File | null;
    let tempFileBase64: string | undefined = undefined;
    let tempFileName: string | undefined = undefined;

    if (backupFile && backupFile.size > 0) {
        if (backupFile.size > 4 * 1024 * 1024) { // 4MB Limit
            return { message: "File backup terlalu besar (Maks 4MB)" };
        }

        try {
            const buffer = Buffer.from(await backupFile.arrayBuffer());
            tempFileBase64 = `data:${backupFile.type};base64,${buffer.toString('base64')}`;
            tempFileName = backupFile.name;
        } catch (error) {
            console.error("Error processing backup file:", error);
            return { message: "Gagal memproses file backup" };
        }
    }

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

        const shouldUseNewTempFile = tempFileBase64 !== undefined;

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
                submittedAt,
                // @ts-ignore: Prisms types might not update instantly in IDE cache
                tempFile: tempFileBase64 || null,
                tempFileName: tempFileName || null
            },
            update: {
                content: content || '',
                fileUrl: finalFileUrl,
                fileName: finalFileName,
                status,
                submittedAt: submittedAt || existing?.submittedAt,
                // Only update tempFile if a new one is uploaded
                ...(shouldUseNewTempFile ? {
                    tempFile: tempFileBase64,
                    tempFileName: tempFileName
                } : {})
            }
        });

        revalidatePath(`/student/assignments/${assignmentId}`);
        revalidatePath(`/student/courses`);

        const msg = action === 'SUBMIT'
            ? "Tugas berhasil diserahkan!"
            : (tempFileName ? "Draft & Backup File berhasil disimpan!" : "Draft berhasil disimpan!");

        return {
            message: msg,
            success: true
        };

    } catch (e) {
        console.error(e);
        return { message: "Gagal menyimpan submission" };
    }
}

export async function getDraftFile(assignmentId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const submission = await prisma.submission.findUnique({
        where: {
            studentId_assignmentId: {
                studentId: session.user.id,
                assignmentId
            }
        },
        select: {
            tempFile: true,
            tempFileName: true
        }
    });

    if (!submission?.tempFile) return { error: "No draft file found" };

    return {
        file: submission.tempFile,
        name: submission.tempFileName
    };
}
