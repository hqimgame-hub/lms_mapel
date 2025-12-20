import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

// Standard Next.js middleware export
export default auth;

// Next.js 16 proxy convention (keep as named export just in case)
export const proxy = auth;

export const config = {
    // Standard Next.js matcher
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
