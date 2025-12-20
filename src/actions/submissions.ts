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

        // Logic for Google Drive Upload on Submit
        let finalFileUrl = fileUrl !== undefined ? fileUrl : existing?.fileUrl;
        let finalFileName = fileName !== undefined ? fileName : existing?.fileName;

        if (status === 'SUBMITTED' && finalFileUrl && finalFileUrl.startsWith('/uploads/')) {
            const absolutePath = join(process.cwd(), 'public', finalFileUrl);

            // Upload to Google Drive
            // Determine mime type roughly
            const ext = finalFileName?.split('.').pop()?.toLowerCase();
            let mimeType = 'application/octet-stream';
            if (ext === 'pdf') mimeType = 'application/pdf';
            if (ext === 'docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            if (ext === 'xlsx') mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

            console.log(`Mengunggah ke Google Drive: ${finalFileName}...`);

            // Organize file into Assignment specific folder
            // We need to fetch assignment title. Since we don't have it easily here without querying,
            // we will query it.
            let folderId = undefined;
            try {
                const assignment = await prisma.assignment.findUnique({
                    where: { id: assignmentId },
                    select: { title: true } // Only get title
                });
                if (assignment?.title) {
                    const sanitizedTitle = assignment.title.replace(/[\/\\:"*?<>|]+/g, "-").trim();
                    folderId = await getOrCreateFolder(sanitizedTitle);
                }
            } catch (e) {
                console.error("Error organizing folder:", e);
                // Fallback to root folder if error
            }

            const driveResult = await uploadToDrive(absolutePath, finalFileName || 'Tugas Siswa', mimeType, folderId || undefined);

            if (driveResult) {
                console.log("Upload GDrive Berhasil:", driveResult.webViewLink);
                finalFileUrl = driveResult.webViewLink; // Update URL to Drive Link

                // Optional: Delete local file immediately to save space
                try {
                    await unlink(absolutePath);
                } catch (e) {
                    console.error("Gagal menghapus file lokal setelah upload drive:", e);
                }
            } else {
                console.error("Gagal upload ke GDrive, tetap menggunakan file lokal.");
            }
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
