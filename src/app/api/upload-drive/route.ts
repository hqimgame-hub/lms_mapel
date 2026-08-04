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

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const targetFolderId = extractFolderId(assignment.driveFolderUrl);
        const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL?.trim();

        // 1. Try Google Apps Script Web App Bridge if configured (Bypasses Service Account 0MB & Kemdikbud domain limits)
        if (appsScriptUrl && targetFolderId) {
            try {
                const base64Data = buffer.toString("base64");
                const payload = {
                    folderId: targetFolderId,
                    fileName: file.name,
                    mimeType: file.type || "application/octet-stream",
                    fileData: base64Data,
                };

                const appsRes = await fetch(appsScriptUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                    redirect: "follow",
                });

                const appsResult = await appsRes.json();

                if (appsResult && (appsResult.status === "success" || appsResult.success) && appsResult.fileUrl) {
                    return NextResponse.json({
                        success: true,
                        fileUrl: appsResult.fileUrl,
                        fileName: appsResult.fileName || file.name,
                        fileId: appsResult.fileId
                    });
                } else if (appsResult && appsResult.message) {
                    console.error("Apps Script Error:", appsResult.message);
                }
            } catch (err: any) {
                console.error("Apps Script Bridge Upload Error:", err);
            }
        }

        // 2. Fallback to Google Service Account upload
        const driveResult = await uploadToDrive(buffer, file.name, file.type, assignment.driveFolderUrl || undefined);

        if (!driveResult || 'error' in driveResult || !driveResult.webViewLink) {
            let errDetail = (driveResult && 'error' in driveResult) ? driveResult.error : "Gagal mengunggah file";
            
            if (typeof errDetail === 'string' && errDetail.includes("Service Accounts do not have storage quota")) {
                errDetail = "Folder Google Drive ini dibuat di 'Drive Saya' (My Drive). Google mewajibkan folder berada di 'Drive Bersama' (Shared Drive / Team Drive) agar Service Account server dapat mengunggah file tanpa terkendala kuota 0MB Service Account. Silakan pindahkan/buat folder di menu 'Drive Bersama' pada Google Drive Anda.";
            }

            console.error("Drive Upload Failed:", errDetail);
            const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.replace(/[,"]/g, '').trim() || 'drive-api-lms-tikkka@lms-tik-kka.iam.gserviceaccount.com';
            return NextResponse.json({
                error: `Gagal mengunggah ke Google Drive: ${errDetail}`
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            fileUrl: driveResult.webViewLink,
            fileName: file.name,
            fileId: driveResult.id
        });

    } catch (error: any) {
        console.error("Drive upload API error:", error);
        return NextResponse.json({
            error: `Terjadi kesalahan saat memproses unggahan file: ${error?.message || error?.toString() || 'Unknown error'}`
        }, { status: 500 });
    }
}
