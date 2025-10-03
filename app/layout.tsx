// app/layout.tsx
import "./globals.css"
import type { Metadata, Viewport } from "next"
import ServiceWorkerManager from "./services/ServiceWorkerManager"

export const metadata: Metadata = {
  title: "Katkot - Affiliate Social Platform",
  description:
    "Katkot is not just a social media app – it's a platform where people share affiliate links, explore new products, and connect through content.",
  keywords: [
    "Katkot",
    "affiliate marketing",
    "affiliate links",
    "social media",
    "product discovery",
    "share products",
    "connect with people",
    "earn online",
    "digital marketing",
  ],
  openGraph: {
    title: "Katkot - Share Affiliate Links & Discover Products",
    description:
      "Katkot lets you share your affiliate links, discover trending products, and connect with others in a social platform built for creators and marketers.",
    url: "https://www.katkot.com",
    siteName: "Katkot",
    images: [
      {
        url: "/logo1.png",
        width: 800,
        height: 600,
        alt: "Katkot Platform Logo",
      },
    ],
    type: "website",
  },
  icons: {
    icon: "/favico.png",
    shortcut: "/favico.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",   
  height: "device-height", 
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,     
  interactiveWidget: "resizes-content", 
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerManager />
        {children}
      </body>
    </html>
  )
}
