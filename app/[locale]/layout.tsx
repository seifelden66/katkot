import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '../globals.css';
import ClientLayout from './ClientLayout';
// import { Inter } from 'next/font/google';
// const inter = Inter({ subsets: ['latin'] });

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }]; // Add your supported locales
}

export const metadata = {
  title: {
    template: 'Katkot',
    default: 'Katkot - Discover and Share Amazing Products',
  },
  description: 'Join Katkot to discover, share, and discuss amazing products with a community of like-minded people.',
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
  manifest: '/manifest.json',
  metadataBase: new URL('https://katkot.com'),
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ClientLayout>{children}</ClientLayout>
    </NextIntlClientProvider>
  );
}
