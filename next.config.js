/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. ADD THIS FOR AMPLIFY SUCCESS
  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      // 2. ADD YOUR S3 BUCKET HERE
      {
        protocol: 'https',
        hostname: 'cortexcart-uploads-2026.s3.us-east-1.amazonaws.com', // Replace with your actual bucket name
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cortexcart.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      // Fixed this to https to match modern standards
      {
        protocol: 'https',
        hostname: 'googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'a.impactradius-go.com',
        pathname: '/**',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          }
        ],
      },
    ];
  },
};
module.exports = nextConfig;