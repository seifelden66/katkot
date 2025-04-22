
import type { NextConfig } from 'next'
// ① import the plugin factory
import createNextIntlPlugin from 'next-intl/plugin'
const baseConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ]
  },
  i18n: {
    locales: ['en', 'ar'],
    defaultLocale: 'en',
  },
  allowedDevOrigins: ['http://192.168.1.111'],
};

const nextConfig = createNextIntlPlugin(baseConfig);

export default nextConfig;
