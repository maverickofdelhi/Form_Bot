/** @type {import('next').NextConfig} */
const nextConfig = {
    // Python API support
    rewrites: async () => {
        return [
            {
                source: '/api/:path*',
                destination: '/api/:path*',
            },
        ];
    },
};

export default nextConfig;
