// app/layout.tsx
export const metadata = {
  title: {
    template: 'Katkot',
    default: 'Katkot - Discover and Share Amazing Products',
  },
  favicon: {
    rel: 'icon',
    type: 'image/x-icon',
    sizes: 'any',
    href: '/logo1.png'
  },
  description: 'Join Katkot to discover, share, and discuss amazing products with a community of like-minded people.',
  keywords: ['product discovery', 'social sharing', 'product recommendations', 'community', 'shopping', 'reviews'],
  openGraph: {
    title: 'Katkot - Discover and Share Amazing Products',
    description: 'Join Katkot to discover, share, and discuss amazing products with a community of like-minded people.',
    url: 'https://katkot.com',
    siteName: 'Katkot',
    images: [
      {
        url: '/logo1.png',
        width: 1200,
        height: 630,
        alt: 'Katkot - Social Product Discovery',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo1.png',
    shortcut: '/logo1.png',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://katkot.com',
    languages: {
      'en-US': 'https://katkot.com/en-US',
    },
  },
  authors: [
    { name: 'Katkot Team', url: 'https://katkot.com/about' }
  ],
  category: 'Social Shopping',
  metadataBase: new URL('https://katkot.com'),
}

import './globals.css'
import ClientLayout from './ClientLayout'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}
