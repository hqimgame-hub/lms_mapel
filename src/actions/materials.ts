'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActionState } from "./types";

export async function createMaterial(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const courseIds = formData.getAll('courseIds') as string[];
    const published = formData.get('published') === 'on'; // Checkbox value

    // Get all content items (format: contentItems[0][type], contentItems[0][content], etc.)
    const contentItems: { type: string; content: string }[] = [];
    let index = 0;
    while (formData.has(`contentItems[${index}][type]`)) {
        const type = formData.get(`contentItems[${index}][type]`) as string;
        const content = formData.get(`contentItems[${index}][content]`) as string;
        if (type && content) {
            contentItems.push({ type, content });
        }
        index++;
    }

    if (!title || courseIds.length === 0 || contentItems.length === 0) {
        return { message: "Harap isi judul, pilih minimal satu kelas, dan tambahkan minimal satu konten", success: false, errors: undefined };
    }

    try {
        await Promise.all(courseIds.map(courseId =>
            prisma.material.create({
                data: {
                    title,
                    description,
                    courseId,
                    published,
                    contents: {
                        create: contentItems.map((item, idx) => ({
                            type: item.type,
                            content: item.content,
                            order: idx
                        }))
                    }
                }
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
    const courseId = formData.get('courseId') as string;
    const published = formData.get('published') === 'on';

    // Get all content items
    const contentItems: { type: string; content: string }[] = [];
    let index = 0;
    while (formData.has(`contentItems[${index}][type]`)) {
        const type = formData.get(`contentItems[${index}][type]`) as string;
        const content = formData.get(`contentItems[${index}][content]`) as string;
        if (type && content) {
            contentItems.push({ type, content });
        }
        index++;
    }

    if (!title || contentItems.length === 0) {
        return { message: "Harap isi judul dan tambahkan minimal satu konten", success: false, errors: undefined };
    }

    try {
        await prisma.material.update({
            where: { id },
            data: {
                title,
                description,
                published,
                contents: {
                    deleteMany: {}, // Delete all existing content items
                    create: contentItems.map((item, idx) => ({
                        type: item.type,
                        content: item.content,
                        order: idx
                    }))
                }
            }
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
