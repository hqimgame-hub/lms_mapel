'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActionState } from "./types";

export async function createMaterial(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const content = formData.get('content') as string;
    const courseIds = formData.getAll('courseIds') as string[];

    if (!title || !type || !content || courseIds.length === 0) {
        return { message: "Harap isi semua bidang wajib dan pilih minimal satu kelas", success: false, errors: undefined };
    }

    try {
        await Promise.all(courseIds.map(courseId =>
            prisma.material.create({
                data: { title, description, type, content, courseId }
            })
        ));

        courseIds.forEach(id => revalidatePath(`/teacher/courses/${id}`));
        revalidatePath('/teacher/materials');
        return { message: "Materi berhasil dibagikan!", success: true, errors: undefined };
    } catch (error) {
        console.error(error);
        return { message: "Gagal membagikan materi", success: false, errors: undefined };
    }
}

export async function updateMaterial(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const content = formData.get('content') as string;
    const courseId = formData.get('courseId') as string;

    if (!title || !type || !content) {
        return { message: "Harap isi semua bidang wajib", success: false, errors: undefined };
    }

    try {
        await prisma.material.update({
            where: { id },
            data: { title, description, type, content }
        });

        revalidatePath(`/teacher/courses/${courseId}`);
        revalidatePath('/teacher/materials');
        return { message: "Materi berhasil diperbarui!", success: true, errors: undefined };
    } catch (error) {
        console.error(error);
        return { message: "Gagal memperbarui materi", success: false, errors: undefined };
    }
}

export async function deleteMaterial(id: string, courseId: string) {
    try {
        await prisma.material.delete({ where: { id } });
        revalidatePath(`/teacher/courses/${courseId}`);
        revalidatePath('/teacher/materials');
        return { message: "Materi berhasil dihapus!", success: true };
    } catch (error) {
        return { message: "Gagal menghapus materi", success: false };
    }
}
