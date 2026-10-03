/**
 * Script Pembantu untuk Mendapatkan GOOGLE_REFRESH_TOKEN Akun Gmail Pribadi
 * 
 * Cara Penggunaan:
 * 1. Jalankan: node scripts/get-refresh-token.js
 * 2. Masukkan Client ID & Client Secret dari Google Cloud Console
 * 3. Buka URL otorisasi di browser dan login dengan akun Gmail Anda
 * 4. Salin kode yang muncul dan paste ke terminal ini
 * 5. Script akan langsung menampilkan GOOGLE_REFRESH_TOKEN yang siap dimasukkan ke .env / Vercel!
 */

const { google } = require('googleapis');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
    console.log('\n=== PANDUAN MENDAPATKAN GOOGLE REFRESH TOKEN (GMAIL PRIBADI) ===\n');

    const clientId = (await question('1. Masukkan GOOGLE_CLIENT_ID: ')).trim();
    const clientSecret = (await question('2. Masukkan GOOGLE_CLIENT_SECRET: ')).trim();

    if (!clientId || !clientSecret) {
        console.error('Client ID dan Client Secret tidak boleh kosong.');
        rl.close();
        return;
    }

    // Menggunakan redirect URI standar untuk OAuth Desktop / Out-Of-Band
    // atau http://localhost:3000 jika Web Application
    const redirectUri = 'https://developers.google.com/oauthplayground';

    const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
    );

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['https://www.googleapis.com/auth/drive.file']
    });

    console.log('\n--- LANGKAH SELANJUTNYA ---');
    console.log('Pastikan di Google Cloud Console -> Credentials -> OAuth Client Anda,');
    console.log(`pada bagian "Authorized redirect URIs" sudah ditambahkan:`);
    console.log(`>>> ${redirectUri} <<<\n`);

    console.log('Buka URL berikut di browser Anda:');
    console.log('----------------------------------------------------');
    console.log(authUrl);
    console.log('----------------------------------------------------\n');

    const code = (await question('3. Masukkan Authorization Code yang Anda peroleh: ')).trim();

    try {
        const { tokens } = await oauth2Client.getToken(code);
        console.log('\n=== BERHASIL! ===\n');
        console.log('Tambahkan variabel ini ke file .env Anda atau Dashboard Vercel:');
        console.log('----------------------------------------------------');
        console.log(`GOOGLE_CLIENT_ID=${clientId}`);
        console.log(`GOOGLE_CLIENT_SECRET=${clientSecret}`);
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log('----------------------------------------------------\n');
        console.log('Catatan: Simpan token ini dengan aman. Kuota backup otomatis kini menggunakan 15 GB akun Gmail pribadi Anda!');
    } catch (err) {
        console.error('\nGagal menukarkan kode:', err.message);
    } finally {
        rl.close();
    }
}

main();
