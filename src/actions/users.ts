'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionState } from "./types";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

const UserSchema = z.object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    username: z.string().min(3, "Username minimal 3 karakter"),
    email: z.union([
        z.string().email("Format email tidak valid"),
        z.literal(''),
        z.null(),
        z.undefined()
    ]).optional(),
    password: z.union([
        z.string().min(6, "Password minimal 6 karakter"),
        z.literal(''),
        z.null(),
        z.undefined()
    ]).optional(),
    role: z.enum(["TEACHER", "STUDENT", "ADMIN"]),
    classId: z.string().optional(),
});

export async function createUser(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const data = {
        name: formData.get('name'),
        username: formData.get('username'),
        email: formData.get('email') || undefined,
        password: formData.get('password'),
        role: formData.get('role'),
        classId: formData.get('classId') || undefined,
    };

    const validated = UserSchema.safeParse(data);

    if (!validated.success) {
        return {
            success: false,
            message: "Data input tidak valid",
            errors: validated.error.flatten().fieldErrors
        };
    }

    try {
        const hashedPassword = await bcrypt.hash(validated.data.password || 'password123', 10);
        const createData = {
            name: validated.data.name,
            username: validated.data.username,
            email: validated.data.email || null,
            password: hashedPassword,
            role: validated.data.role,
        };
        await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: createData
            });

            if (validated.data.role === 'STUDENT' && validated.data.classId) {
                await tx.enrollment.create({
                    data: {
                        userId: user.id,
                        classId: validated.data.classId
                    }
                });
            }
        });
        revalidatePath('/admin/users');
        return { success: true, message: "Pengguna berhasil dibuat!", errors: undefined };
    } catch (e: any) {
        console.error("Create User Error:", e);
        if (e.code === 'P2002') {
            return { success: false, message: "Username atau Email sudah ada", errors: undefined };
        }
        return { success: false, message: "Gagal membuat pengguna: " + (e.message || "Terjadi kesalahan"), errors: undefined };
    }
}

export async function updateUser(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const id = formData.get('id') as string;
    const data = {
        name: formData.get('name'),
        username: formData.get('username'),
        email: formData.get('email') || undefined,
        password: formData.get('password') || undefined,
        role: formData.get('role'),
    };

    const validated = UserSchema.safeParse(data);

    if (!validated.success) {
        return {
            success: false,
            message: "Data input tidak valid",
            errors: validated.error.flatten().fieldErrors
        };
    }

    try {
        const updateData: any = {
            name: validated.data.name,
            username: validated.data.username,
            email: validated.data.email || null,
            role: validated.data.role,
        };

        if (validated.data.password && validated.data.password.length >= 6) {
            updateData.password = await bcrypt.hash(validated.data.password, 10);
        }

        console.log(`Updating user ID ${id} with data:`, JSON.stringify(updateData, null, 2));

        await prisma.user.update({
            where: { id },
            data: updateData
        });

        revalidatePath('/admin/users');
        return { success: true, message: "Pengguna berhasil diperbarui!", errors: undefined };
    } catch (e: any) {
        console.error("Update User Error:", e);
        if (e.code === 'P2002') {
            return { success: false, message: "Username atau Email sudah ada", errors: undefined };
        }
        return { success: false, message: "Gagal memperbarui pengguna: " + (e.message || "Terjadi kesalahan"), errors: undefined };
    }
}

export async function deleteUser(id: string) {
    try {
        await prisma.user.delete({
            where: { id }
        });
        revalidatePath('/admin/users');
        return { success: true, message: "Pengguna berhasil dihapus", errors: undefined };
    } catch (e) {
        return { success: false, message: "Gagal menghapus pengguna", errors: undefined };
    }
}

export async function registerStudent(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const email = formData.get('email') as string;
    const classId = formData.get('classId') as string;

    if (!email) {
        return {
            success: false,
            message: "Email wajib diisi untuk pendaftaran siswa",
            errors: { email: ["Email wajib diisi"] }
        };
    }

    if (!classId) {
        return {
            success: false,
            message: "Kelas wajib dipilih",
            errors: { classId: ["Pilih kelas terlebih dahulu"] }
        };
    }

    const data = {
        name: formData.get('name'),
        username: formData.get('username'),
        email: email,
        password: formData.get('password'),
        role: 'STUDENT',
    };

    const validated = UserSchema.safeParse(data);

    if (!validated.success) {
        return {
            success: false,
            message: "Data pendaftaran tidak valid",
            errors: validated.error.flatten().fieldErrors
        };
    }

    try {
        const hashedPassword = await bcrypt.hash(validated.data.password || '', 10);

        await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name: validated.data.name,
                    username: validated.data.username,
                    email: validated.data.email || null,
                    password: hashedPassword,
                    role: 'STUDENT',
                }
            });

            await tx.enrollment.create({
                data: {
                    userId: user.id,
                    classId: classId
                }
            });
        });

        return { success: true, message: "Pendaftaran berhasil! Silakan login.", errors: undefined };
    } catch (e: any) {
        console.error("Register Student Error:", e);
        if (e.code === 'P2002') {
            return { success: false, message: "Username atau Email sudah digunakan", errors: undefined };
        }
        return { success: false, message: "Gagal melakukan pendaftaran: " + (e.message || "Terjadi kesalahan"), errors: undefined };
    }
}

export async function updateProfile(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password && password !== confirmPassword) {
        return { success: false, message: "Konfirmasi password tidak cocok", errors: undefined };
    }

    try {
        const updateData: any = { email: email || undefined };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: updateData
        });

        return { success: true, message: "Profil berhasil diperbarui!", errors: undefined };
    } catch (e: any) {
        if (e.code === 'P2002') return { success: false, message: "Email sudah digunakan", errors: undefined };
        return { success: false, message: "Gagal memperbarui profil", errors: undefined };
    }
}

export async function deleteUsersBulk(ids: string[]) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { success: false, message: "Unauthorized" };

    try {
        await prisma.user.deleteMany({
            where: {
                id: { in: ids }
            }
        });
        revalidatePath('/admin/users');
        return { success: true, message: `${ids.length} pengguna berhasil dihapus.`, errors: undefined };
    } catch (e) {
        console.error(e);
        return { success: false, message: "Gagal menghapus beberapa pengguna.", errors: undefined };
    }
}
