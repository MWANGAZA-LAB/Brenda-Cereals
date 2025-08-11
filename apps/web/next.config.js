const nextConfig = {
    output: 'standalone',
    images: {
        domains: ['localhost'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    transpilePackages: ['@tanstack/react-query'],
    experimental: {
        optimizePackageImports: ['@brenda-cereals/ui', '@brenda-cereals/utils'],
    },
    // Performance optimizations
    compress: true,
    poweredByHeader: false,
    // Temporarily disable linting during build
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Environment variables validation
    env: {
        CUSTOM_KEY: process.env.CUSTOM_KEY,
    },
};
module.exports = nextConfig;
