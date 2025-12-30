import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
    try {
        // Attempt to push the database schema
        // We add --accept-data-loss just in case, though adding a column usually is safe.
        // However, be careful. For adding a column with default, it's safe.
        const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss');

        return NextResponse.json({
            success: true,
            message: "Database migration attempted",
            stdout,
            stderr
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: "Migration failed",
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
