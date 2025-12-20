
const fs = require('fs');
const path = require('path');

// Load .env manually since we might not have dotenv installed in devDependencies or want to keep it simple
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '..', '.env');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const envVars = {};
        envFile.split('\n').forEach(line => {
            const [key, ...value] = line.split('=');
            if (key && value) {
                envVars[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
            }
        });
        return envVars;
    } catch (e) {
        console.error("Could not read .env file:", e.message);
        return {};
    }
}

const env = loadEnv();
const requiredKeys = [
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'GOOGLE_DRIVE_FOLDER_ID'
];

console.log("--- Verifying Google Drive Credentials ---");
let missing = [];

requiredKeys.forEach(key => {
    const val = env[key];
    if (!val || val.length < 5) {
        console.log(`[X] ${key} is MISSING or too short.`);
        missing.push(key);
    } else {
        // Special check for private key format
        if (key === 'GOOGLE_PRIVATE_KEY' && !val.includes('BEGIN PRIVATE KEY')) {
            console.log(`[!] ${key} found but looks invalid (missing headers).`);
        } else {
            console.log(`[V] ${key} is set.`);
        }
    }
});

if (missing.length === 0) {
    console.log("\nSUCCESS: All configurations look ready! 🚀");
} else {
    console.log("\nFAILURE: Some configurations are missing.");
}
