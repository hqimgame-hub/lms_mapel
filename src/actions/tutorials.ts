'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isYouTubeUrl } from "@/lib/youtube";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionState } from "./types";

// Types for clients
export type TutorialItemData = {
    id: string;
    topicId: string;
    title: string;
    type: string;
    url: string;
    order: number;
    createdAt: Date;
};

export type TutorialTopicData = {
    id: string;
    title: string;
    description: string | null;
    placement: string;
    isActive: boolean;
    order: number;
    items: TutorialItemData[];
};

// Check if user is ADMIN
async function verifyAdmin() {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }
}

// Public / Student fetcher
export async function getActiveTutorials(placement?: 'LOGIN' | 'DASHBOARD'): Promise<TutorialTopicData[]> {
    try {
        const whereClause: any = {
            isActive: true,
        };

        if (placement) {
            whereClause.placement = {
                in: [placement, 'BOTH']
            };
        }

        const topics = await prisma.tutorialTopic.findMany({
            where: whereClause,
            include: {
                items: {
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: [
                { order: 'asc' },
                { createdAt: 'asc' }
            ]
        });

        return topics;
    } catch (error) {
        console.error('Error fetching active tutorials:', error);
        return [];
    }
}

// Admin fetcher: all topics
export async function getAllTutorialsAdmin() {
    await verifyAdmin();

    return prisma.tutorialTopic.findMany({
        include: {
            items: {
                orderBy: { order: 'asc' }
            },
            _count: {
                select: { items: true }
            }
        },
        orderBy: [
            { order: 'asc' },
            { createdAt: 'desc' }
        ]
    });
}

// Admin fetcher: single topic with items
export async function getTutorialTopicById(id: string) {
    await verifyAdmin();

    return prisma.tutorialTopic.findUnique({
        where: { id },
        include: {
            items: {
                orderBy: { order: 'asc' }
            }
        }
    });
}

// Schemas
const TopicSchema = z.object({
    title: z.string().min(2, "Judul minimal 2 karakter"),
    description: z.string().optional().nullable(),
    placement: z.enum(['LOGIN', 'DASHBOARD', 'BOTH']),
    isActive: z.boolean().default(true),
    order: z.coerce.number().default(0),
});

const ItemSchema = z.object({
    topicId: z.string().min(1, "Topik wajib dipilih"),
    title: z.string().min(2, "Judul minimal 2 karakter"),
    url: z.string().url("Format URL tidak valid (harus diawali http:// atau https://)"),
    type: z.enum(['YOUTUBE', 'BLOG', 'LINK']).optional(),
    order: z.coerce.number().default(0),
});

// TOPIC ACTIONS
export async function createTutorialTopic(prevState: ActionState, formData: FormData): Promise<ActionState> {
    try {
        await verifyAdmin();

        const rawData = {
            title: formData.get('title'),
            description: formData.get('description') || null,
            placement: formData.get('placement') || 'BOTH',
            isActive: formData.get('isActive') === 'true' || formData.get('isActive') === 'on',
            order: formData.get('order') || 0,
        };

        const validated = TopicSchema.safeParse(rawData);
        if (!validated.success) {
            return {
                success: false,
                message: "Input tidak valid",
                errors: validated.error.flatten().fieldErrors
            };
        }

        await prisma.tutorialTopic.create({
            data: {
                title: validated.data.title,
                description: validated.data.description,
                placement: validated.data.placement,
                isActive: validated.data.isActive,
                order: validated.data.order,
            }
        });

        revalidatePath('/admin/tutorials');
        revalidatePath('/login');
        revalidatePath('/student');

        return {
            success: true,
            message: "Topik panduan berhasil ditambahkan!",
        };
    } catch (e: any) {
        return {
            success: false,
            message: e.message || "Gagal menambahkan topik panduan",
        };
    }
}

export async function updateTutorialTopic(prevState: ActionState, formData: FormData): Promise<ActionState> {
    try {
        await verifyAdmin();
        const id = formData.get('id') as string;

        if (!id) {
            return { success: false, message: "ID Topik tidak ditemukan" };
        }

        const rawData = {
            title: formData.get('title'),
            description: formData.get('description') || null,
            placement: formData.get('placement') || 'BOTH',
            isActive: formData.get('isActive') === 'true' || formData.get('isActive') === 'on',
            order: formData.get('order') || 0,
        };

        const validated = TopicSchema.safeParse(rawData);
        if (!validated.success) {
            return {
                success: false,
                message: "Input tidak valid",
                errors: validated.error.flatten().fieldErrors
            };
        }

        await prisma.tutorialTopic.update({
            where: { id },
            data: {
                title: validated.data.title,
                description: validated.data.description,
                placement: validated.data.placement,
                isActive: validated.data.isActive,
                order: validated.data.order,
            }
        });

        revalidatePath('/admin/tutorials');
        revalidatePath(`/admin/tutorials/${id}`);
        revalidatePath('/login');
        revalidatePath('/student');

        return {
            success: true,
            message: "Topik panduan berhasil diperbarui!",
        };
    } catch (e: any) {
        return {
            success: false,
            message: e.message || "Gagal memperbarui topik panduan",
        };
    }
}

export async function toggleTutorialTopicStatus(id: string, currentStatus: boolean): Promise<ActionState> {
    try {
        await verifyAdmin();

        await prisma.tutorialTopic.update({
            where: { id },
            data: { isActive: !currentStatus }
        });

        revalidatePath('/admin/tutorials');
        revalidatePath('/login');
        revalidatePath('/student');

        return {
            success: true,
            message: `Status berhasil diubah menjadi ${!currentStatus ? 'Aktif' : 'Nonaktif'}`,
        };
    } catch (e: any) {
        return {
            success: false,
            message: e.message || "Gagal mengubah status panduan",
        };
    }
}

export async function deleteTutorialTopic(id: string): Promise<ActionState> {
    try {
        await verifyAdmin();

        await prisma.tutorialTopic.delete({
            where: { id }
        });

        revalidatePath('/admin/tutorials');
        revalidatePath('/login');
        revalidatePath('/student');

        return {
            success: true,
            message: "Topik panduan dan tautan di dalamnya berhasil dihapus!",
        };
    } catch (e: any) {
        return {
            success: false,
            message: e.message || "Gagal menghapus topik panduan",
        };
    }
}

// ITEM ACTIONS
export async function createTutorialItem(prevState: ActionState, formData: FormData): Promise<ActionState> {
    try {
        await verifyAdmin();

        const topicId = formData.get('topicId') as string;
        const title = formData.get('title') as string;
        const rawUrl = (formData.get('url') as string || '').trim();
        let type = formData.get('type') as string;

        // Auto-detect YouTube if not explicitly chosen or if user provided youtube link
        if (!type || type === 'AUTO') {
            type = isYouTubeUrl(rawUrl) ? 'YOUTUBE' : 'BLOG';
        }

        const rawData = {
            topicId,
            title,
            url: rawUrl,
            type: type as any,
            order: formData.get('order') || 0,
        };

        const validated = ItemSchema.safeParse(rawData);
        if (!validated.success) {
            return {
                success: false,
                message: "Input tidak valid",
                errors: validated.error.flatten().fieldErrors
            };
        }

        await prisma.tutorialItem.create({
            data: {
                topicId: validated.data.topicId,
                title: validated.data.title,
                url: validated.data.url,
                type: validated.data.type || (isYouTubeUrl(validated.data.url) ? 'YOUTUBE' : 'BLOG'),
                order: validated.data.order,
            }
        });

        revalidatePath(`/admin/tutorials/${topicId}`);
        revalidatePath('/admin/tutorials');
        revalidatePath('/login');
        revalidatePath('/student');

        return {
            success: true,
            message: "Tautan panduan berhasil ditambahkan!",
        };
    } catch (e: any) {
        return {
            success: false,
            message: e.message || "Gagal menambahkan tautan panduan",
        };
    }
}

export async function updateTutorialItem(prevState: ActionState, formData: FormData): Promise<ActionState> {
    try {
        await verifyAdmin();

        const id = formData.get('id') as string;
        const topicId = formData.get('topicId') as string;
        const title = formData.get('title') as string;
        const rawUrl = (formData.get('url') as string || '').trim();
        let type = formData.get('type') as string;

        if (!id) {
            return { success: false, message: "ID item tidak ditemukan" };
        }

        if (!type || type === 'AUTO') {
            type = isYouTubeUrl(rawUrl) ? 'YOUTUBE' : 'BLOG';
        }

        const rawData = {
            topicId,
            title,
            url: rawUrl,
            type: type as any,
            order: formData.get('order') || 0,
        };

        const validated = ItemSchema.safeParse(rawData);
        if (!validated.success) {
            return {
                success: false,
                message: "Input tidak valid",
                errors: validated.error.flatten().fieldErrors
            };
        }

        await prisma.tutorialItem.update({
            where: { id },
            data: {
                title: validated.data.title,
                url: validated.data.url,
                type: validated.data.type || (isYouTubeUrl(validated.data.url) ? 'YOUTUBE' : 'BLOG'),
                order: validated.data.order,
            }
        });

        revalidatePath(`/admin/tutorials/${topicId}`);
        revalidatePath('/admin/tutorials');
        revalidatePath('/login');
        revalidatePath('/student');

        return {
            success: true,
            message: "Tautan panduan berhasil diperbarui!",
        };
    } catch (e: any) {
        return {
            success: false,
            message: e.message || "Gagal memperbarui tautan panduan",
        };
    }
}

export async function deleteTutorialItem(id: string, topicId: string): Promise<ActionState> {
    try {
        await verifyAdmin();

        await prisma.tutorialItem.delete({
            where: { id }
        });

        revalidatePath(`/admin/tutorials/${topicId}`);
        revalidatePath('/admin/tutorials');
        revalidatePath('/login');
        revalidatePath('/student');

        return {
            success: true,
            message: "Tautan panduan berhasil dihapus!",
        };
    } catch (e: any) {
        return {
            success: false,
            message: e.message || "Gagal menghapus tautan panduan",
        };
    }
}
