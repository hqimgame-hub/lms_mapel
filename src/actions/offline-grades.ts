'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function saveOfflineGrades(assignmentId: string, grades: { studentId: string, grade: number | null, feedback: string }[]) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'TEACHER') {
        return { message: "Unauthorized", success: false };
    }

    try {
        await prisma.$transaction(
            grades.map((gradeData) => {
                return prisma.submission.upsert({
                    where: {
                        studentId_assignmentId: {
                            studentId: gradeData.studentId,
                            assignmentId: assignmentId
                        }
                    },
                    update: {
                        grade: gradeData.grade,
                        feedback: gradeData.feedback,
                        status: 'GRADED',
                        submittedAt: new Date(),
                    },
                    create: {
                        studentId: gradeData.studentId,
                        assignmentId: assignmentId,
                        grade: gradeData.grade,
                        feedback: gradeData.feedback,
                        status: 'GRADED',
                        submittedAt: new Date(),
                        content: '',
                    }
                });
            })
        );

        revalidatePath(`/teacher/assignments/${assignmentId}`);
        revalidatePath(`/student/assignments/${assignmentId}`);
        revalidatePath(`/student/courses`);

        return { message: "Nilai berhasil disimpan!", success: true };
    } catch (e) {
        console.error(e);
        return { message: "Gagal menyimpan nilai", success: false };
    }
}
