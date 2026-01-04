'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirect } from "next/navigation";
import { ActionState } from "./types";

const AssignmentSchema = z.object({
    title: z.string().min(3, "Title too short"),
    description: z.string().optional(),
    dueDate: z.string().transform((str) => new Date(str)),
    courseIds: z.array(z.string()).min(1, "Pilih setidaknya satu kelas"),
    published: z.boolean().default(true),
    attachmentUrl: z.string().optional().nullable(),
});

export async function createAssignment(prevState: any, formData: FormData) {
    const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        dueDate: formData.get('dueDate'),
        courseIds: formData.getAll('courseIds'),
        published: formData.get('published') === 'on',
        attachmentUrl: formData.get('attachmentUrl'),
    };

    const validated = AssignmentSchema.safeParse(data);

    if (!validated.success) {
        return { success: false, message: "Data tidak valid", errors: validated.error.flatten().fieldErrors };
    }

    try {
        // Create assignments for all selected courses
        await Promise.all(validated.data.courseIds.map(courseId =>
            prisma.assignment.create({
                data: {
                    title: validated.data.title,
                    description: validated.data.description || null,
                    dueDate: validated.data.dueDate,
                    courseId: courseId,
                    published: validated.data.published,
                    attachmentUrl: validated.data.attachmentUrl || null,
                }
            })
        ));

        // Revalidate all affected course pages
        validated.data.courseIds.forEach(id => revalidatePath(`/teacher/courses/${id}`));
        revalidatePath('/teacher/assignments');

        return { message: "Tugas berhasil dibagikan ke kelas terpilih!", success: true, errors: undefined };
    } catch (e) {
        console.error(e);
        return { message: "Gagal membuat tugas", success: false, errors: undefined };
    }
}

export async function updateAssignment(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const id = formData.get('id') as string;
    const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        dueDate: formData.get('dueDate'),
        courseIds: [formData.get('courseId') as string],
        published: formData.get('published') === 'on',
        attachmentUrl: formData.get('attachmentUrl'),
    };

    const validated = AssignmentSchema.safeParse(data);

    if (!validated.success) {
        return { success: false, message: "Data tidak valid", errors: validated.error.flatten().fieldErrors };
    }

    try {
        await prisma.assignment.update({
            where: { id },
            data: {
                title: validated.data.title,
                description: validated.data.description || null,
                dueDate: validated.data.dueDate,
                published: validated.data.published,
                attachmentUrl: validated.data.attachmentUrl || null,
            }
        });

        revalidatePath(`/teacher/courses/${data.courseIds[0]}`);
        revalidatePath(`/teacher/assignments/${id}`);
        revalidatePath('/teacher/assignments');

        return { message: "Tugas berhasil diperbarui!", success: true, errors: undefined };
    } catch (e) {
        console.error(e);
        return { message: "Gagal memperbarui tugas", success: false, errors: undefined };
    }
}

export async function deleteAssignment(id: string, courseId: string) {
    try {
        await prisma.assignment.delete({
            where: { id }
        });
        revalidatePath(`/teacher/courses/${courseId}`);
        return { success: true, message: "Assignment deleted successfully", errors: undefined };
    } catch (e) {
        return { success: false, message: "Failed to delete assignment", errors: undefined };
    }
}
