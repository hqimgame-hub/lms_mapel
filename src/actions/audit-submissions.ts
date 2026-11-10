'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";

async function requireAdmin() {
    const session = await getSession();
    if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error('Akses ditolak: Hanya Admin yang dapat melakukan tindakan ini.');
    }
    return session;
}

export async function getMismatchedSubmissions() {
    await requireAdmin();

    const allSubmissions = await prisma.submission.findMany({
        include: {
            student: {
                include: {
                    enrollments: {
                        include: { class: true }
                    }
                }
            },
            assignment: {
                include: {
                    course: {
                        include: { class: true, subject: true, teacher: true }
                    }
                }
            }
        },
        orderBy: { submittedAt: 'desc' }
    });

    const mismatched: any[] = [];

    for (const sub of allSubmissions) {
        const student = sub.student;
        const currentEnrollment = student.enrollments?.[0];
        const currentClassId = currentEnrollment?.classId;
        const assignmentClassId = sub.assignment.course.classId;

        // If student is not enrolled in this assignment's class
        if (currentClassId && currentClassId !== assignmentClassId) {
            // Check if there is an assignment in the student's current class with a matching title
            const targetAssignment = await prisma.assignment.findFirst({
                where: {
                    title: {
                        equals: sub.assignment.title,
                        mode: 'insensitive'
                    },
                    course: {
                        classId: currentClassId
                    }
                },
                include: {
                    course: {
                        include: { class: true, subject: true }
                    }
                }
            });

            // Check if target assignment already has a submission by this student
            let existingTargetSub: any = null;
            if (targetAssignment) {
                existingTargetSub = await prisma.submission.findUnique({
                    where: {
                        studentId_assignmentId: {
                            studentId: student.id,
                            assignmentId: targetAssignment.id
                        }
                    }
                });
            }

            mismatched.push({
                id: sub.id,
                status: sub.status,
                submittedAt: sub.submittedAt ? sub.submittedAt.toISOString() : null,
                fileName: sub.fileName,
                fileUrl: sub.fileUrl,
                content: sub.content,
                grade: sub.grade,
                feedback: sub.feedback,
                student: {
                    id: student.id,
                    name: student.name,
                    username: student.username,
                    currentClass: currentEnrollment.class.name,
                    currentClassId: currentEnrollment.class.id
                },
                assignment: {
                    id: sub.assignment.id,
                    title: sub.assignment.title,
                    sourceClass: sub.assignment.course.class.name,
                    sourceClassId: sub.assignment.course.class.id,
                    subjectName: sub.assignment.course.subject.name,
                    teacherName: sub.assignment.course.teacher.name
                },
                targetAssignment: targetAssignment ? {
                    id: targetAssignment.id,
                    title: targetAssignment.title,
                    className: targetAssignment.course.class.name,
                    hasExistingSubmission: Boolean(existingTargetSub),
                    existingSubmissionStatus: existingTargetSub?.status || null
                } : null
            });
        }
    }

    return mismatched;
}

export async function migrateSubmission(submissionId: string) {
    try {
        await requireAdmin();

        const sub = await prisma.submission.findUnique({
            where: { id: submissionId },
            include: {
                student: {
                    include: {
                        enrollments: { include: { class: true } }
                    }
                },
                assignment: true
            }
        });

        if (!sub) {
            return { success: false, message: 'Submisi tidak ditemukan.' };
        }

        const currentClassId = sub.student.enrollments?.[0]?.classId;
        if (!currentClassId) {
            return { success: false, message: 'Siswa saat ini tidak terdaftar di kelas manapun.' };
        }

        // Find assignment in current class
        const targetAssignment = await prisma.assignment.findFirst({
            where: {
                title: {
                    equals: sub.assignment.title,
                    mode: 'insensitive'
                },
                course: {
                    classId: currentClassId
                }
            }
        });

        if (!targetAssignment) {
            return {
                success: false,
                message: `Tidak ditemukan tugas dengan judul "${sub.assignment.title}" di kelas siswa saat ini.`
            };
        }

        // Check if student already has a submission record in the target assignment
        const existingTargetSub = await prisma.submission.findUnique({
            where: {
                studentId_assignmentId: {
                    studentId: sub.studentId,
                    assignmentId: targetAssignment.id
                }
            }
        });

        if (existingTargetSub) {
            // Overwrite/update target submission with source submission's work if source had files
            await prisma.submission.update({
                where: { id: existingTargetSub.id },
                data: {
                    fileUrl: sub.fileUrl || existingTargetSub.fileUrl,
                    fileName: sub.fileName || existingTargetSub.fileName,
                    content: sub.content || existingTargetSub.content,
                    status: sub.status === 'SUBMITTED' ? 'SUBMITTED' : existingTargetSub.status,
                    submittedAt: sub.submittedAt || existingTargetSub.submittedAt
                }
            });

            // Delete the old orphan submission
            await prisma.submission.delete({
                where: { id: sub.id }
            });
        } else {
            // Move by updating assignmentId
            await prisma.submission.update({
                where: { id: sub.id },
                data: {
                    assignmentId: targetAssignment.id
                }
            });
        }

        revalidatePath('/admin/audit-submissions');
        revalidatePath('/teacher/grading');
        revalidatePath('/admin/classes');
        revalidatePath('/admin/users');

        return { success: true, message: `Submisi berhasil dipindahkan ke tugas kelas ${sub.student.enrollments[0].class.name}.` };
    } catch (error: any) {
        console.error('Migrate submission error:', error);
        return { success: false, message: error.message || 'Gagal memindahkan submisi.' };
    }
}

export async function deleteMismatchedSubmission(submissionId: string) {
    try {
        await requireAdmin();

        await prisma.submission.delete({
            where: { id: submissionId }
        });

        revalidatePath('/admin/audit-submissions');
        revalidatePath('/teacher/grading');
        revalidatePath('/admin/classes');
        revalidatePath('/admin/users');

        return { success: true, message: 'Submisi berhasil dihapus.' };
    } catch (error: any) {
        console.error('Delete mismatched submission error:', error);
        return { success: false, message: error.message || 'Gagal menghapus submisi.' };
    }
}

export async function dismissMismatchedSubmission(submissionId: string) {
    try {
        await requireAdmin();

        await prisma.submission.update({
            where: { id: submissionId },
            data: {
                status: 'DRAFT',
                submittedAt: null
            }
        });

        revalidatePath('/admin/audit-submissions');
        revalidatePath('/teacher/grading');

        return { success: true, message: 'Status submisi diubah ke DRAFT (dikeluarkan dari antrean penilaian).' };
    } catch (error: any) {
        console.error('Dismiss submission error:', error);
        return { success: false, message: error.message || 'Gagal mengubah status submisi.' };
    }
}

export async function batchCleanOrMigrateAll() {
    try {
        await requireAdmin();

        const mismatches = await getMismatchedSubmissions();
        let migratedCount = 0;
        let deletedCount = 0;

        for (const item of mismatches) {
            if (item.targetAssignment) {
                const res = await migrateSubmission(item.id);
                if (res.success) migratedCount++;
            } else if (item.status === 'RETURNED' || item.status === 'DRAFT') {
                const res = await deleteMismatchedSubmission(item.id);
                if (res.success) deletedCount++;
            }
        }

        revalidatePath('/admin/audit-submissions');
        revalidatePath('/teacher/grading');

        return {
            success: true,
            message: `Pembersihan selesai: ${migratedCount} submisi dipindahkan, ${deletedCount} submisi usang dihapus.`
        };
    } catch (error: any) {
        console.error('Batch clean error:', error);
        return { success: false, message: error.message || 'Gagal memproses pembersihan massal.' };
    }
}
