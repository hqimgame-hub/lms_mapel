'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActionState } from "./types";

export async function createExam(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const link = formData.get('link') as string;
    const startTime = formData.get('startTime') ? new Date(formData.get('startTime') as string) : null;
    const endTime = formData.get('endTime') ? new Date(formData.get('endTime') as string) : null;
    const duration = formData.get('duration') ? parseInt(formData.get('duration') as string) : null;
    // Use endTime as dueDate if available, or fallback to manual due date input which is hidden
    const dueDate = endTime || (formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : null);
    const published = formData.get('published') === 'on';

    const courseIds = formData.getAll('courseIds') as string[];

    if (!title || !link || courseIds.length === 0) {
        return { message: "Harap isi semua bidang wajib dan pilih minimal satu kelas", success: false, errors: undefined };
    }

    try {
        await Promise.all(courseIds.map(courseId =>
            prisma.exam.create({
                data: {
                    title,
                    description,
                    link,
                    dueDate,
                    startTime,
                    endTime,
                    duration,
                    published,
                    type: 'GFORM',
                    courseId
                }
            })
        ));

        courseIds.forEach(id => revalidatePath(`/teacher/courses/${id}`));
        revalidatePath('/teacher/exams');
        return { message: "Ujian berhasil dibagikan!", success: true, errors: undefined };
    } catch (error) {
        console.error(error);
        return { message: "Gagal membuat ujian", success: false, errors: undefined };
    }
}

export async function updateExam(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const link = formData.get('link') as string;
    const startTime = formData.get('startTime') ? new Date(formData.get('startTime') as string) : null;
    const endTime = formData.get('endTime') ? new Date(formData.get('endTime') as string) : null;
    const duration = formData.get('duration') ? parseInt(formData.get('duration') as string) : null;
    const dueDate = endTime || (formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : null);
    const courseId = formData.get('courseId') as string;
    const published = formData.get('published') === 'on';

    if (!title || !link) {
        return { message: "Harap isi semua bidang wajib", success: false, errors: undefined };
    }

    try {
        await prisma.exam.update({
            where: { id },
            data: { title, description, link, dueDate, startTime, endTime, duration, published }
        });

        revalidatePath(`/teacher/courses/${courseId}`);
        revalidatePath('/teacher/exams');
        return { message: "Ujian berhasil diperbarui!", success: true, errors: undefined };
    } catch (error) {
        console.error(error);
        return { message: "Gagal memperbarui ujian", success: false, errors: undefined };
    }
}

export async function deleteExam(id: string, courseId: string) {
    try {
        await prisma.exam.delete({ where: { id } });
        revalidatePath(`/teacher/courses/${courseId}`);
        revalidatePath('/teacher/exams');
        return { message: "Ujian berhasil dihapus!", success: true };
    } catch (error) {
        return { message: "Gagal menghapus ujian", success: false };
    }
}
