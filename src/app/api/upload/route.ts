import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readdir, unlink, stat } from "fs/promises";
import { join } from "path";
import { auth } from "@/auth";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");
const MAX_FILE_AGE_DAYS = 3; // Batas waktu file tersimpan (hari) - Draf sementara

async function cleanupOldFiles() {
    try {
        const files = await readdir(UPLOAD_DIR);
        const now = Date.now();
        const maxAgeMs = MAX_FILE_AGE_DAYS * 24 * 60 * 60 * 1000;

        for (const file of files) {
            const filePath = join(UPLOAD_DIR, file);
            const fileStat = await stat(filePath);

            if (now - fileStat.mtimeMs > maxAgeMs) {
                console.log(`Menghapus file lama: ${file}`);
                await unlink(filePath);
            }
        }
    } catch (error) {
        console.error("Cleanup error:", error);
    }
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Safety check: Limit file size to 10MB
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "Ukuran file terlalu besar (Maksimal 10MB)" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize filename and add timestamp to avoid collisions
        const timestamp = Date.now();
        const originalName = file.name;
        const sanitizedName = originalName.replace(/[^a-zA-Z0-9.]/g, "_");
        const filename = `${timestamp}_${sanitizedName}`;

        const uploadDir = join(process.cwd(), "public", "uploads");

        // Ensure directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Already exists or other error
        }

        const path = join(uploadDir, filename);
        await writeFile(path, buffer);

        // Cleanup old files (>3 days) - Optimized for 1000+ users
        // Only run cleanup with 10% probability to avoid disk overhead on every request
        if (Math.random() < 0.1) {
            cleanupOldFiles();
        }

        return NextResponse.json({
            success: true,
            url: `/uploads/${filename}`,
            name: originalName
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
