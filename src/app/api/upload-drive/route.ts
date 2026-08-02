import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadToDrive, extractFolderId } from "@/lib/drive";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "temp_drive");

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const assignmentId = formData.get("assignmentId") as string;

        if (!file) {
            return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
        }

        if (!assignmentId) {
            return NextResponse.json({ error: "Assignment ID tidak ditemukan" }, { status: 400 });
        }

        // Limit file size to 25MB for Drive upload
        const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "Ukuran file terlalu besar (Maksimal 25MB)" }, { status: 400 });
        }

        // Find assignment to get teacher's driveFolderUrl if specified
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            select: { driveFolderUrl: true, enableDriveUpload: true }
        });

        if (!assignment) {
            return NextResponse.json({ error: "Tugas tidak ditemukan" }, { status: 404 });
        }

        const targetFolderId = extractFolderId(assignment.driveFolderUrl);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const filename = `${timestamp}_${sanitizedName}`;

        try {
            await mkdir(UPLOAD_DIR, { recursive: true });
        } catch (e) {
            // Already exists
        }

        const tempFilePath = join(UPLOAD_DIR, filename);
        await writeFile(tempFilePath, buffer);

        // Upload to Google Drive using Service Account
        const driveResult = await uploadToDrive(tempFilePath, file.name, file.type, targetFolderId || undefined);

        // Clean up temporary local file immediately
        try {
            await unlink(tempFilePath);
        } catch (e) {
            console.error("Failed to delete temp file:", e);
        }

        if (!driveResult || !driveResult.webViewLink) {
            return NextResponse.json({ error: "Gagal mengunggah file ke Google Drive. Pastikan folder Drive guru telah memberikan akses ke Service Account." }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            fileUrl: driveResult.webViewLink,
            fileName: file.name,
            fileId: driveResult.id
        });

    } catch (error) {
        console.error("Drive upload API error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan saat memproses unggahan file" }, { status: 500 });
    }
}
