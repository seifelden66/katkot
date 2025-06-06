'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SunIcon, MoonIcon, MenuIcon, CloseIcon, SearchIcon } from '@/components/icons/Icons'
import { useLocale } from 'next-intl';

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
  const locale = useLocale();
  const router = useRouter();

  const handleSearchClick = () => {
    router.push(`/${locale}/search`);
  };

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 border-b border-[hsl(var(--border))] px-4 py-3 flex justify-between items-center bg-[hsl(var(--background))]">
      <Link href={`/${locale}`} className="flex items-center gap-2">
        <span className="text-xl font-bold text-[hsl(var(--primary))]">Katkot</span>
      </Link>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSearchClick}
          className="p-2 rounded-full bg-[hsl(var(--muted))]"
        >
          <SearchIcon />
        </button>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-[hsl(var(--muted))]"
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-full bg-[hsl(var(--muted))]"
        >
          {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
    </header>
  )
}