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

        // Limit file size to 4MB for Vercel Serverless payload limit
        const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "Ukuran file terlalu besar (Maksimal 4MB per file)" }, { status: 400 });
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

        const rawUrl = assignment.driveFolderUrl?.trim() || "";
        const isDirectAppsScript = rawUrl.includes("script.google.com");
        const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyyydF3JhxrhtxoyEFvdS2WSuXrf-g0Dpm7u7Mmar_6ZQDToXMEY6ZTMRR7VVYqn5i5/exec";
        const appsScriptUrl = isDirectAppsScript ? rawUrl : (process.env.GOOGLE_APPS_SCRIPT_URL?.trim() || DEFAULT_APPS_SCRIPT_URL);
        const targetFolderId = extractFolderId(rawUrl);

        // 1. Try Google Apps Script Web App Bridge if URL is direct Apps Script or configured in env
        if (appsScriptUrl) {
            try {
                const base64Data = buffer.toString("base64");
                const payload = {
                    folderId: targetFolderId || undefined,
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

                const resText = await appsRes.text();
                let appsResult: any = null;
                try {
                    appsResult = JSON.parse(resText);
                } catch (e) {
                    console.error("Apps Script non-JSON response:", resText.slice(0, 300));
                    return NextResponse.json({
                        error: "Google Apps Script mengembalikan respon non-JSON. Pastikan saat Deploy Apps Script, pengaturan 'Who has access' (Siapa yang memiliki akses) disetel ke 'Anyone' (Siapa saja)."
                    }, { status: 500 });
                }

                if (appsResult && (appsResult.status === "success" || appsResult.success) && appsResult.fileUrl) {
                    return NextResponse.json({
                        success: true,
                        fileUrl: appsResult.fileUrl,
                        fileName: appsResult.fileName || file.name,
                        fileId: appsResult.fileId
                    });
                } else if (appsResult && (appsResult.error || appsResult.message)) {
                    const appsErr = appsResult.error || appsResult.message;
                    console.error("Apps Script Error:", appsErr);
                    return NextResponse.json({
                        error: `Gagal mengunggah via Apps Script Web App: ${appsErr}`
                    }, { status: 500 });
                }
            } catch (err: any) {
                console.error("Apps Script Bridge Upload Error:", err);
                return NextResponse.json({
                    error: `Gagal menghubungkan ke Apps Script Web App: ${err?.message || err?.toString()}`
                }, { status: 500 });
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
