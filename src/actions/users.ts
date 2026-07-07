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

// ─── TEACHER-SCOPED ACTIONS ───────────────────────────────────────────────────

/**
 * Mendapatkan semua siswa di semua kelas yang diajarkan guru tersebut.
 * Dikelompokkan per kelas.
 */
export async function getTeacherStudents(teacherId: string) {
    const courses = await prisma.course.findMany({
        where: { teacherId },
        select: {
            class: {
                select: {
                    id: true,
                    name: true,
                    students: {
                        select: {
                            user: {
                                select: { id: true, name: true, username: true, email: true }
                            }
                        },
                        orderBy: { user: { name: 'asc' } }
                    }
                }
            }
        }
    });

    // Deduplicate kelas (guru bisa mengajar >1 mapel di kelas yang sama)
    const classMap = new Map<string, { id: string; name: string; students: { id: string; name: string; username: string; email: string | null }[] }>();
    for (const course of courses) {
        const cls = course.class;
        if (!classMap.has(cls.id)) {
            classMap.set(cls.id, {
                id: cls.id,
                name: cls.name,
                students: cls.students.map(e => e.user)
            });
        }
    }
    return Array.from(classMap.values());
}

const TeacherUpdateStudentSchema = z.object({
    studentId: z.string().min(1),
    name: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.union([
        z.string().email("Format email tidak valid"),
        z.literal(''),
        z.null(),
        z.undefined()
    ]).optional(),
    newPassword: z.union([
        z.string().min(6, "Password minimal 6 karakter"),
        z.literal(''),
        z.null(),
        z.undefined()
    ]).optional(),
});

/**
 * Guru dapat mengupdate data siswa di kelasnya (nama, email, reset password).
 * Tidak bisa ubah username/role. Hanya siswa di kelasnya yang bisa diubah.
 */
export async function updateStudentByTeacher(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'TEACHER') {
        return { success: false, message: "Akses ditolak. Hanya guru yang dapat melakukan ini." };
    }
    const teacherId = session.user.id;

    const data = {
        studentId: formData.get('studentId') as string,
        name: formData.get('name'),
        email: formData.get('email') || undefined,
        newPassword: formData.get('newPassword') || undefined,
    };

    const validated = TeacherUpdateStudentSchema.safeParse(data);
    if (!validated.success) {
        return { success: false, message: "Data tidak valid", errors: validated.error.flatten().fieldErrors };
    }

    // Verifikasi: apakah siswa ini benar-benar di kelas yang diajar guru ini?
    const enrollment = await prisma.enrollment.findFirst({
        where: {
            userId: validated.data.studentId,
            class: {
                courses: { some: { teacherId } }
            }
        }
    });

    if (!enrollment) {
        return { success: false, message: "Siswa tidak ditemukan di kelas Anda." };
    }

    try {
        const updateData: any = {
            name: validated.data.name,
            email: validated.data.email || null,
        };
        if (validated.data.newPassword && validated.data.newPassword.length >= 6) {
            updateData.password = await bcrypt.hash(validated.data.newPassword, 10);
        }

        await prisma.user.update({
            where: { id: validated.data.studentId },
            data: updateData,
        });

        revalidatePath('/teacher/students');
        return { success: true, message: "Data siswa berhasil diperbarui!", errors: undefined };
    } catch (e: any) {
        if (e.code === 'P2002') return { success: false, message: "Email sudah digunakan akun lain.", errors: undefined };
        return { success: false, message: "Gagal memperbarui data siswa.", errors: undefined };
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

export async function deleteAllStudents() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { success: false, message: "Unauthorized" };

    try {
        const result = await prisma.user.deleteMany({
            where: {
                role: 'STUDENT'
            }
        });
        revalidatePath('/admin/users');
        return { success: true, message: `Semua data siswa (${result.count} orang) berhasil dihapus beserta seluruh riwayat pengerjaan tugas dan kelas mereka.`, errors: undefined };
    } catch (e) {
        console.error(e);
        return { success: false, message: "Gagal menghapus semua siswa.", errors: undefined };
    }
}

export async function promoteStudentsBulk(studentIds: string[], targetClassId: string | null) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { success: false, message: "Unauthorized" };

    if (!studentIds || studentIds.length === 0) {
        return { success: false, message: "Pilih minimal satu siswa untuk dipindahkan." };
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Hapus pendaftaran kelas lama (Enrollment) untuk siswa-siswa terpilih
            await tx.enrollment.deleteMany({
                where: {
                    userId: { in: studentIds }
                }
            });

            // 2. Jika targetClassId diisi (bukan Kelulusan/Alumni), buat pendaftaran baru
            if (targetClassId) {
                const enrollmentsData = studentIds.map(id => ({
                    userId: id,
                    classId: targetClassId
                }));
                
                await tx.enrollment.createMany({
                    data: enrollmentsData
                });
            }
        });

        revalidatePath('/admin/users');
        revalidatePath('/admin/classes');
        
        const actionMessage = targetClassId 
            ? `Berhasil memindahkan ${studentIds.length} siswa ke kelas baru.` 
            : `Berhasil memproses kelulusan ${studentIds.length} siswa (keanggotaan kelas telah dikosongkan).`;
            
        return { success: true, message: actionMessage, errors: undefined };
    } catch (e) {
        console.error("Failed to promote students:", e);
        return { success: false, message: "Gagal memproses kenaikan kelas siswa.", errors: undefined };
    }
}

