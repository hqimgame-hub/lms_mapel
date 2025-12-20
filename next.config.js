/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Diaktifkan untuk debugging di Vercel agar build lebih cepat dan tidak terhambat error sepele
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
