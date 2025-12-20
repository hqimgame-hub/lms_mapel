'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionState } from "./types";

const CourseSchema = z.object({
    classId: z.string(),
    subjectId: z.string(),
    teacherId: z.string(),
});

export async function createCourse(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const data = {
        classId: formData.get('classId'),
        subjectId: formData.get('subjectId'),
        teacherId: formData.get('teacherId'),
    };

    const validated = CourseSchema.safeParse(data);

    if (!validated.success) {
        return {
            success: false,
            message: "Input tidak valid",
            errors: validated.error.flatten().fieldErrors
        };
    }

    try {
        await prisma.course.create({
            data: {
                classId: validated.data.classId,
                subjectId: validated.data.subjectId,
                teacherId: validated.data.teacherId,
            }
        });
        revalidatePath('/admin/courses');
        return { success: true, message: "Alokasi kursus berhasil!", errors: undefined };
    } catch (e: any) {
        if (e.code === 'P2002') {
            return { success: false, message: "Mata pelajaran ini sudah dialokasikan ke kelas ini.", errors: undefined };
        }
        return { success: false, message: "Gagal membuat kursus", errors: undefined };
    }
}

export async function updateCourse(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const id = formData.get('id') as string;
    const data = {
        classId: formData.get('classId'),
        subjectId: formData.get('subjectId'),
        teacherId: formData.get('teacherId'),
    };

    const validated = CourseSchema.safeParse(data);

    if (!validated.success) {
        return {
            success: false,
            message: "Input tidak valid",
            errors: validated.error.flatten().fieldErrors
        };
    }

    try {
        await prisma.course.update({
            where: { id },
            data: {
                classId: validated.data.classId,
                subjectId: validated.data.subjectId,
                teacherId: validated.data.teacherId,
            }
        });
        revalidatePath('/admin/courses');
        return { success: true, message: "Alokasi kursus berhasil diperbarui!", errors: undefined };
    } catch (e: any) {
        if (e.code === 'P2002') {
            return { success: false, message: "Mata pelajaran ini sudah dialokasikan ke kelas ini.", errors: undefined };
        }
        return { success: false, message: "Gagal memperbarui kursus", errors: undefined };
    }
}

export async function deleteCourse(id: string) {
    try {
        await prisma.course.delete({
            where: { id }
        });
        revalidatePath('/admin/courses');
        return { success: true, message: "Alokasi kursus berhasil dihapus", errors: undefined };
    } catch (e) {
        return { success: false, message: "Gagal menghapus alokasi kursus", errors: undefined };
    }
}
