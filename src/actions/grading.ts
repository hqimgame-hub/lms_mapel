'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";

const GradeSchema = z.object({
    submissionId: z.string(),
    grade: z.coerce.number().min(0).max(100),
    feedback: z.string().optional(),
    teacherTag: z.string().nullable().optional(),
    teacherNote: z.string().nullable().optional(),
    assignmentId: z.string(), // Needed for revalidation
});

export async function gradeSubmission(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'TEACHER') {
        return { message: "Akses ditolak", success: false };
    }

    const rawTag = formData.get('teacherTag')?.toString();
    const rawNote = formData.get('teacherNote')?.toString();

    const data = {
        submissionId: formData.get('submissionId'),
        grade: formData.get('grade'),
        feedback: formData.get('feedback'),
        teacherTag: rawTag && rawTag !== 'NONE' ? rawTag : null,
        teacherNote: rawNote?.trim() ? rawNote.trim() : null,
        assignmentId: formData.get('assignmentId'),
    };

    const validated = GradeSchema.safeParse(data);

    if (!validated.success) {
        return { message: "Input tidak valid", errors: validated.error.flatten().fieldErrors, success: false };
    }

    try {
        const updatePayload: any = {
            grade: validated.data.grade,
            feedback: validated.data.feedback,
            status: 'GRADED'
        };

        if (data.teacherTag !== undefined) {
            updatePayload.teacherTag = data.teacherTag;
        }
        if (data.teacherNote !== undefined) {
            updatePayload.teacherNote = data.teacherNote;
        }

        await prisma.submission.update({
            where: { id: validated.data.submissionId },
            data: updatePayload
        });

        revalidatePath(`/teacher/assignments/${validated.data.assignmentId}`);
        revalidatePath(`/teacher/recap`);
        return { message: "Nilai dan catatan berhasil disimpan!", success: true };
    } catch (e) {
        console.error("Grade submission error:", e);
        return { message: "Gagal menyimpan nilai", success: false };
    }
}

/**
 * Menandai dan memberi catatan privat guru pada tugas tertentu untuk seorang siswa.
 */
export async function saveSubmissionTagAndNote(
    assignmentId: string,
    studentId: string,
    teacherTag: string | null,
    teacherNote: string | null
) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'TEACHER') {
        return { success: false, message: "Akses ditolak" };
    }

    const cleanTag = teacherTag && teacherTag !== 'NONE' ? teacherTag.trim() : null;
    const cleanNote = teacherNote?.trim() ? teacherNote.trim() : null;

    try {
        await prisma.submission.upsert({
            where: {
                studentId_assignmentId: {
                    studentId,
                    assignmentId
                }
            },
            update: {
                teacherTag: cleanTag,
                teacherNote: cleanNote
            },
            create: {
                studentId,
                assignmentId,
                status: 'UNSUBMITTED',
                teacherTag: cleanTag,
                teacherNote: cleanNote
            }
        });

        revalidatePath(`/teacher/assignments/${assignmentId}`);
        revalidatePath(`/teacher/recap`);
        return { success: true, message: "Tanda dan catatan tugas berhasil disimpan!" };
    } catch (e: any) {
        console.error("Save submission tag error:", e);
        return { success: false, message: "Gagal menyimpan tanda: " + (e.message || "Terjadi kesalahan") };
    }
}

/**
 * Menandai banyak siswa sekaligus pada satu tugas (di akhir penilaian)
 */
export async function batchTagSubmissions(
    assignmentId: string,
    studentIds: string[],
    teacherTag: string | null
) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'TEACHER') {
        return { success: false, message: "Akses ditolak" };
    }

    if (!studentIds || studentIds.length === 0) {
        return { success: false, message: "Pilih minimal 1 siswa" };
    }

    const cleanTag = teacherTag && teacherTag !== 'NONE' ? teacherTag.trim() : null;

    try {
        await prisma.$transaction(
            studentIds.map(studentId => {
                return prisma.submission.upsert({
                    where: {
                        studentId_assignmentId: {
                            studentId,
                            assignmentId
                        }
                    },
                    update: {
                        teacherTag: cleanTag
                    },
                    create: {
                        studentId,
                        assignmentId,
                        status: 'UNSUBMITTED',
                        teacherTag: cleanTag
                    }
                });
            })
        );

        revalidatePath(`/teacher/assignments/${assignmentId}`);
        revalidatePath(`/teacher/recap`);
        return { success: true, message: `Berhasil menandai ${studentIds.length} siswa pada tugas ini.` };
    } catch (e: any) {
        console.error("Batch tag error:", e);
        return { success: false, message: "Gagal menandai massal: " + (e.message || "Terjadi kesalahan") };
    }
}

