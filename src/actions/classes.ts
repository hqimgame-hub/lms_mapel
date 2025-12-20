'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionState } from "./types";

const ClassSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
});

function generateClassCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createClass(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const data = {
        name: formData.get('name'),
        description: formData.get('description'),
    };

    const validated = ClassSchema.safeParse(data);

    if (!validated.success) {
        return {
            success: false,
            message: "Input tidak valid",
            errors: validated.error.flatten().fieldErrors
        };
    }

    try {
        const code = generateClassCode();

        await prisma.class.create({
            data: {
                name: validated.data.name,
                description: validated.data.description || null,
                code: code
            }
        });
        revalidatePath('/admin/classes');
        return { success: true, message: "Kelas berhasil dibuat!", errors: undefined };
    } catch (e) {
        return { success: false, message: "Gagal membuat kelas", errors: undefined };
    }
}

export async function updateClass(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const id = formData.get('id') as string;
    const data = {
        name: formData.get('name'),
        description: formData.get('description'),
    };

    const validated = ClassSchema.safeParse(data);

    if (!validated.success) {
        return {
            success: false,
            message: "Input tidak valid",
            errors: validated.error.flatten().fieldErrors
        };
    }

    try {
        await prisma.class.update({
            where: { id },
            data: {
                name: validated.data.name,
                description: validated.data.description || null,
            }
        });
        revalidatePath('/admin/classes');
        return { success: true, message: "Kelas berhasil diperbarui!", errors: undefined };
    } catch (e) {
        return { success: false, message: "Gagal memperbarui kelas", errors: undefined };
    }
}

export async function deleteClass(id: string) {
    try {
        await prisma.class.delete({
            where: { id }
        });
        revalidatePath('/admin/classes');
        return { success: true, message: "Kelas berhasil dihapus", errors: undefined };
    } catch (e) {
        return { success: false, message: "Gagal menghapus kelas", errors: undefined };
    }
}

export async function getClasses() {
    try {
        return await prisma.class.findMany({
            orderBy: { name: 'asc' }
        });
    } catch (e) {
        return [];
    }
}
