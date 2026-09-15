import { cache } from 'react';
import { auth } from '@/auth';

/**
 * Cached version of auth() using React's cache().
 *
 * Dalam satu render request, Next.js App Router memanggil Sidebar, Header,
 * dan Page secara bersamaan. Tanpa cache(), auth() dipanggil 3x (atau lebih)
 * per halaman — masing-masing melakukan JWT decode + kemungkinan DB lookup.
 *
 * Dengan cache(), semua komponen dalam satu render tree berbagi satu hasil
 * auth() yang sama — hanya 1 operasi JWT decode per request.
 */
export const getSession = cache(auth);
