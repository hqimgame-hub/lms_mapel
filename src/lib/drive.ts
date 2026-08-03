import { google } from 'googleapis';
import { createReadStream } from 'fs';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export function extractFolderId(input?: string | null): string | null {
    if (!input) return null;
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Match /folders/ID or /d/ID
    const folderMatch = trimmed.match(/\/(?:folders|d)\/([a-zA-Z0-9_-]+)/);
    if (folderMatch && folderMatch[1]) {
        return folderMatch[1];
    }

    // Match query parameter ?id=ID or &id=ID or ?fileId=ID
    const idParam = trimmed.match(/[?&](?:id|fileId)=([a-zA-Z0-9_-]+)/);
    if (idParam && idParam[1]) {
        return idParam[1];
    }

    // Pure ID string (alphanumeric with - and _)
    if (!trimmed.includes('/') && /^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) {
        return trimmed;
    }

    // Fallback: match any 25+ char string
    const matchAnyId = trimmed.match(/([a-zA-Z0-9_-]{25,50})/);
    if (matchAnyId && matchAnyId[1]) {
        return matchAnyId[1];
    }

    return null;
}

import { Readable } from 'stream';

function getCredentials() {
    let clientEmail: string | undefined = undefined;
    let privateKey: string | undefined = undefined;

    // Support single JSON env var (Opsi B)
    const jsonCredentials = process.env.GOOGLE_DRIVE_CREDENTIALS;
    if (jsonCredentials) {
        try {
            const parsed = JSON.parse(jsonCredentials);
            clientEmail = parsed.client_email || parsed.clientEmail;
            privateKey = parsed.private_key || parsed.privateKey;
        } catch (e) {
            console.error("Failed to parse GOOGLE_DRIVE_CREDENTIALS JSON:", e);
        }
    }

    // Fallback to individual env vars
    if (!clientEmail) {
        const rawEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        clientEmail = rawEmail ? rawEmail.replace(/[,"]/g, '').trim() : undefined;
    }

    if (!privateKey) {
        privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();
        if (privateKey && privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.slice(1, -1);
        }
    }

    return { clientEmail, privateKey };
}

export async function uploadToDrive(
    fileInput: string | Buffer,
    fileName: string,
    mimeType: string,
    folderId?: string
) {
    try {
        const { clientEmail, privateKey } = getCredentials();

        const defaultFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
        const parsedFolderId = extractFolderId(folderId) || defaultFolderId;

        if (!clientEmail) {
            console.error("Missing GOOGLE_DRIVE_CREDENTIALS or GOOGLE_SERVICE_ACCOUNT_EMAIL");
            return { error: "GOOGLE_DRIVE_CREDENTIALS / GOOGLE_SERVICE_ACCOUNT_EMAIL belum ada di Environment Variable server" };
        }

        if (!privateKey) {
            console.error("Missing GOOGLE_PRIVATE_KEY");
            return { error: "GOOGLE_PRIVATE_KEY belum ada di Environment Variable server" };
        }

        if (!parsedFolderId) {
            console.error("Missing parsedFolderId", { folderId, defaultFolderId });
            return { error: `Guru belum memasukkan Link Folder Google Drive pada tugas ini (Tersimpan: '${folderId || 'Kosong'}')` };
        }

        const auth = new google.auth.JWT({
            email: clientEmail,
            key: privateKey,
            scopes: SCOPES
        });

        const drive = google.drive({ version: 'v3', auth });

        const requestBody = {
            name: fileName,
            parents: [parsedFolderId],
        };

        const mediaBody = typeof fileInput === 'string'
            ? createReadStream(fileInput)
            : Readable.from(fileInput);

        const media = {
            mimeType,
            body: mediaBody,
        };

        const file = await drive.files.create({
            requestBody,
            media: media,
            fields: 'id, webViewLink, webContentLink',
        });

        return {
            id: file.data.id,
            webViewLink: file.data.webViewLink,
            webContentLink: file.data.webContentLink
        };

    } catch (error: any) {
        console.error('Google Drive Upload Error Details:', error);
        return { error: error?.message || error?.toString() || "Google Drive Upload Error" };
    }
}

export async function getOrCreateFolder(folderName: string) {
    try {
        const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

        if (!clientEmail || !privateKey || !rootFolderId) return null;

        const auth = new google.auth.JWT({
            email: clientEmail,
            key: privateKey,
            scopes: SCOPES
        });

        const drive = google.drive({ version: 'v3', auth });

        // Check if folder exists
        const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${rootFolderId}' in parents and trashed=false`;
        const res = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        if (res.data.files && res.data.files.length > 0) {
            return res.data.files[0].id;
        }

        // Create folder if not exists
        const fileMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [rootFolderId]
        };

        const file = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id'
        });

        return file.data.id;

    } catch (error) {
        console.error('Google Drive Folder Error:', error);
        return null;
    }
}
