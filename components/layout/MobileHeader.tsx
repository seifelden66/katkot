'use client'
import Link from 'next/link'
import { SunIcon, MoonIcon, MenuIcon, CloseIcon } from '@/components/icons/Icons'

type MobileHeaderProps = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

export default function MobileHeader({ 
  darkMode, 
  setDarkMode, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}: MobileHeaderProps) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-4 py-3 flex justify-between items-center">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-xl font-bold text-blue-500">Katkot</span>
      </Link>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
        >
          {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
    </header>
  )
}