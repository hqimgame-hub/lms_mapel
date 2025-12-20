import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma) as any,
    session: { strategy: 'jwt' },
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ identifier: z.string(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { identifier, password } = parsedCredentials.data;

                    // Search by username OR email
                    const user = await prisma.user.findFirst({
                        where: {
                            OR: [
                                { username: identifier },
                                { email: identifier }
                            ]
                        }
                    });

                    if (!user) {
                        console.log(`Auth fail: User not found for identifier ${identifier}`);
                        return null;
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) {
                        console.log(`Auth success: ${user.username}`);
                        return user;
                    } else {
                        console.log(`Auth fail: Password mismatch for ${user.username}`);
                    }
                } else {
                    console.log("Auth fail: Invalid credentials format", parsedCredentials.error.format());
                }
                return null;
            },
        }),
    ],
});
