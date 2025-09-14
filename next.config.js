/** @type {import('next').NextConfig} */
const nextConfig = {
  // appDir is now stable in Next.js 14, no need for experimental flag

  // PWA Configuration
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ]
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'Personal Productivity AI',
    NEXT_PUBLIC_APP_VERSION: '0.1.0',
  },

  // Image optimization
  images: {
    domains: ['images.unsplash.com', 'avatars.githubusercontent.com'],
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
