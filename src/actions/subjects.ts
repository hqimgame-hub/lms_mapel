'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SubjectSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
});

export async function createSubject(prevState: any, formData: FormData) {
    const data = {
        name: formData.get('name'),
    };

    const validated = SubjectSchema.safeParse(data);

    if (!validated.success) {
        return {
            success: false,
            message: "Input tidak valid",
            errors: validated.error.flatten().fieldErrors
        };
    }

    try {
        await prisma.subject.create({
            data: {
                name: validated.data.name,
            }
        });
        revalidatePath('/admin/subjects');
        return { success: true, message: "Mapel berhasil dibuat!", errors: undefined };
    } catch (e: any) {
        if (e.code === 'P2002') {
            return { success: false, message: "Nama mapel sudah ada", errors: undefined };
        }
        return { success: false, message: "Gagal membuat mapel", errors: undefined };
    }
}

export async function updateSubject(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const data = {
        name: formData.get('name'),
    };

    const validated = SubjectSchema.safeParse(data);

    if (!validated.success) {
        return {
            success: false,
            message: "Input tidak valid",
            errors: validated.error.flatten().fieldErrors
        };
    }

    try {
        await prisma.subject.update({
            where: { id },
            data: {
                name: validated.data.name,
            }
        });
        revalidatePath('/admin/subjects');
        return { success: true, message: "Mapel berhasil diperbarui!", errors: undefined };
    } catch (e: any) {
        if (e.code === 'P2002') {
            return { success: false, message: "Nama mapel sudah ada", errors: undefined };
        }
        return { success: false, message: "Gagal memperbarui mapel", errors: undefined };
    }
}

export async function deleteSubject(id: string) {
    try {
        await prisma.subject.delete({
            where: { id }
        });
        revalidatePath('/admin/subjects');
        return { success: true, message: "Mapel berhasil dihapus" };
    } catch (e) {
        return { success: false, message: "Gagal menghapus mapel" };
    }
}
