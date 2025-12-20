const fs = require('fs');
const path = require('path');

// Manually load .env
const envPath = path.resolve(process.cwd(), '.env');
console.log(`Checking .env at: ${envPath}`);

if (!fs.existsSync(envPath)) {
    console.error('❌ .env file NOT FOUND');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

const requiredVars = ['POSTGRES_PRISMA_URL', 'POSTGRES_URL_NON_POOLING'];
const foundVars = {};

envLines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const [key, ...valueParts] = trimmed.split('=');
    if (key) {
        foundVars[key.trim()] = valueParts.join('=').trim();
    }
});

let hasError = false;
requiredVars.forEach(varName => {
    if (foundVars[varName]) {
        console.log(`✅ ${varName} found`);
    } else {
        console.error(`❌ ${varName} is MISSING`);
        hasError = true;
    }
});

if (hasError) {
    console.log('\nResult: FAIL. Please verify .env content.');
} else {
    console.log('\nResult: OK. Variables detected.');
}
