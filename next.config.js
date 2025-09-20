/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA/Headers
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
        ],
      },
      {
        // Базовый CSP для XSS защиты и Lighthouse
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' https://www.taskai.space https://personal-productivity-ai.vercel.app",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://securepay.tinkoff.ru",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https://avatars.githubusercontent.com https://images.unsplash.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://securepay.tinkoff.ru https://rest-api-test.tinkoff.ru https://zpgkzvflmgxrlgkecscg.supabase.co",
              "frame-src 'self' https://securepay.tinkoff.ru",
              "base-uri 'self'",
              "form-action 'self' https://securepay.tinkoff.ru",
            ].join('; '),
          },
        ],
      },
    ]
  },

  env: {
    NEXT_PUBLIC_APP_NAME: 'Personal Productivity AI',
    NEXT_PUBLIC_APP_VERSION: '0.1.0',
  },

  images: {
    domains: ['images.unsplash.com', 'avatars.githubusercontent.com'],
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, fs: false }
    }
    return config
  },
}

module.exports = nextConfig
