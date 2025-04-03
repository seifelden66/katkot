'use client'
import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import UserGreeting from '@/components/UserGreeting'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        
        <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">Your Logo</Link>
          <UserGreeting />
        </header>
        {children}
      </body>
    </html>
  )
}

// In the nav section add:

