'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirect } from "next/navigation";

const AssignmentSchema = z.object({
    title: z.string().min(3, "Title too short"),
    description: z.string().optional(),
    dueDate: z.string().transform((str) => new Date(str)),
    courseIds: z.array(z.string()).min(1, "Pilih setidaknya satu kelas"),
});

export async function createAssignment(prevState: any, formData: FormData) {
    const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        dueDate: formData.get('dueDate'),
        courseIds: formData.getAll('courseIds'),
    };

    const validated = AssignmentSchema.safeParse(data);

    if (!validated.success) {
        return { message: "Data tidak valid", errors: validated.error.flatten().fieldErrors };
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
                }
            })
        ));

        // Revalidate all affected course pages
        validated.data.courseIds.forEach(id => revalidatePath(`/teacher/courses/${id}`));
        revalidatePath('/teacher/assignments');

        return { message: "Tugas berhasil dibagikan ke kelas terpilih!", success: true };
    } catch (e) {
        console.error(e);
        return { message: "Gagal membuat tugas" };
    }
}

export async function updateAssignment(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        dueDate: formData.get('dueDate'),
        courseIds: [formData.get('courseId') as string],
    };

    const validated = AssignmentSchema.safeParse(data);

    if (!validated.success) {
        return { message: "Data tidak valid", errors: validated.error.flatten().fieldErrors };
    }

    try {
        await prisma.assignment.update({
            where: { id },
            data: {
                title: validated.data.title,
                description: validated.data.description || null,
                dueDate: validated.data.dueDate,
            }
        });

        revalidatePath(`/teacher/courses/${data.courseIds[0]}`);
        revalidatePath(`/teacher/assignments/${id}`);
        revalidatePath('/teacher/assignments');

        return { message: "Tugas berhasil diperbarui!", success: true };
    } catch (e) {
        console.error(e);
        return { message: "Gagal memperbarui tugas" };
    }
}

export async function deleteAssignment(id: string, courseId: string) {
    try {
        await prisma.assignment.delete({
            where: { id }
        });
        revalidatePath(`/teacher/courses/${courseId}`);
        return { message: "Assignment deleted successfully" };
    } catch (e) {
        return { message: "Failed to delete assignment" };
    }
}
