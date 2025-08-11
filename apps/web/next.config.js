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
        unoptimized: true, // Required for static export
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
    // Static export configuration
    distDir: 'out',
    // Disable server-side features for static export
    skipTrailingSlashRedirect: true,
    skipMiddlewareUrlNormalize: true,
};

module.exports = nextConfig;
