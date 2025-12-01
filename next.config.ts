import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return {
      beforeFiles: [
        // Custom domain rewrites - only match paths that don't already have /site/
        {
          source: '/:path((?!site|api|_next|admin|favicon).*)',
          has: [{ type: 'host', value: 'dramyheart.com' }],
          destination: '/site/dr-amy/:path',
        },
        {
          source: '/:path((?!site|api|_next|admin|favicon).*)',
          has: [{ type: 'host', value: 'www.dramyheart.com' }],
          destination: '/site/dr-amy/:path',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        port: '',
        pathname: '/**',
      },
      // You might want to add your production domain here later
      // {
      //   protocol: 'https',
      //   hostname: 'your-production-domain.com',
      //   port: '',
      //   pathname: '/**',
      // },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;