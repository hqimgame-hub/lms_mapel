import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Create Admin
        await prisma.user.upsert({
            where: { username: 'admin' },
            update: {},
            create: {
                username: 'admin',
                password: hashedPassword,
                name: 'School Administrator',
                role: 'ADMIN',
            },
        });

        // Add small success check
        const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });

        return NextResponse.json({
            success: true,
            message: "Database initialized successfully!",
            adminCount: adminCount
        });
    } catch (error: any) {
        console.error("Setup Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
