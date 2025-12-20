import { google } from 'googleapis';
import { createReadStream } from 'fs';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export async function uploadToDrive(filePath: string, fileName: string, mimeType: string, folderId?: string) {
    try {
        const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Handle newline characters
        const defaultFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

        const targetFolderId = folderId || defaultFolderId;

        if (!clientEmail || !privateKey || !targetFolderId) {
            console.error("Missing Google Drive credentials");
            return null;
        }

        const auth = new google.auth.JWT(
            clientEmail,
            undefined,
            privateKey,
            SCOPES
        );

        const drive = google.drive({ version: 'v3', auth });

        const requestBody = {
            name: fileName,
            parents: [targetFolderId],
        };

        const media = {
            mimeType,
            body: createReadStream(filePath),
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

    } catch (error) {
        console.error('Google Drive Upload Error:', error);
        return null;
    }
}

export async function getOrCreateFolder(folderName: string) {
    try {
        const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

        if (!clientEmail || !privateKey || !rootFolderId) return null;

        const auth = new google.auth.JWT(
            clientEmail,
            undefined,
            privateKey,
            SCOPES
        );

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
