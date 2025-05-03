
import type { NextConfig } from 'next'
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
  // i18n: {
  //   locales: ['en', 'ar'],
  //   defaultLocale: 'en',
  // },
  allowedDevOrigins: ['http://192.168.1.111'],
};


const withNextIntl = createNextIntlPlugin();
const nextConfig = withNextIntl(baseConfig);

export default nextConfig;
