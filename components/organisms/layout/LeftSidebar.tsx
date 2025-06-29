'use client'
import Link from 'next/link'
import UserGreeting from '@/components/molecules/UserGreeting'
import { useSession } from '@/contexts/SessionContext'
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { 
  HomeIcon, 
  ExploreIcon, 
  NotificationIcon, 
  ProfileIcon, 
  CreateIcon, 
  SunIcon, 
  MoonIcon 
} from '@/components/atoms/Icons'
import NotificationBadge from '@/components/molecules/NotificationBadge';


type LeftSidebarProps = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  isMobileMenuOpen: boolean;
}

type NavLink = {
  name: string;
  href: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
}

const navLinks: NavLink[] = [
  {
    name: 'Home',
    href: '/',
    icon: <HomeIcon />
  },
  {
    name: 'Documentation',
    href: '/documentation',
    icon: <ExploreIcon />
  },
  {
    name: 'Notifications',
    href: '/notifications',
    icon: <NotificationIcon />
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: <ProfileIcon />
  },
  {
    name: 'Create Post',
    href: '/posts/create',
    icon: <CreateIcon />,
    requiresAuth: true
  }
];

export default function LeftSidebar({ 
  darkMode, 
  setDarkMode, 
  isMobileMenuOpen 
}: LeftSidebarProps) {
  const locale = useLocale();
  const { session, signOut } = useSession()  

  const router = useRouter();
  const t = useTranslations('sidebar');
  
  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    localStorage.setItem('preferredLocale', newLocale);
    const currentPath = window.location.pathname.replace(/^\/(en|ar)/, '');
    router.push(`/${newLocale}${currentPath}`);
  };

  const isRTL = locale === 'ar';

  return (
    <aside
      className={`fixed lg:sticky top-0 h-screen lg:flex flex-col w-72 border-r border-[hsl(var(--border))] z-30 transform transition-transform duration-300 ease-in-out bg-[hsl(var(--background))] flex flex-col
      ${isRTL 
        ? (isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0') 
        : (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}
      ${isRTL ? 'right-0 lg:right-auto' : 'left-0 lg:left-auto'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-track-transparent pt-20 lg:p-6">
        <div className="hidden lg:flex items-center gap-2 mb-10">
          <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">Katkot</span>
        </div>

        <nav className="space-y-3 mb-8">
          {navLinks.map((link, index) => {
            if (link.requiresAuth && !session) return null;
            const isCreatePost = link.name === 'Create Post';
            const isNotifications = link.name === 'Notifications';
            
            return (
              <Link
                key={index}
                href={`/${locale}${link.href}`}
                className={
                  isCreatePost 
                    ? "flex items-center px-5 py-3 mt-6 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full transition-colors shadow-md"
                    : `flex items-center px-5 py-3 text-[hsl(var(--foreground))] rounded-full hover:bg-[hsl(var(--secondary))] transition-colors`
                }
              >
                
                <div className={`${isCreatePost ? '' : `bg-[hsl(var(--muted))] p-2 rounded-full relative`} ${isRTL ? 'ml-3' : 'mr-3'}`}>
                  {link.icon}
                  {isNotifications && <NotificationBadge />}
                </div>
                <span className={`text-base font-medium ${isCreatePost ? (isRTL ? 'mr-3' : 'ml-3') : (isRTL ? 'mr-4' : 'ml-4')}`}>
                  {t(`nav.${link.name.toLowerCase().replace(' ', '_')}`)}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-[hsl(var(--border))]">
          <div className="rounded-2xl p-4 shadow-sm bg-[hsl(var(--card))]">
            <UserGreeting />

            <div className="flex items-center mt-4 justify-between">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`flex items-center px-4 py-2 text-sm text-[hsl(var(--foreground))] bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--accent))] rounded-full transition-colors shadow-sm`}
              >
                {darkMode ? (
                  <>
                    <SunIcon />
                    <span className={`${isRTL ? 'mr-2' : 'ml-2'}`}>{t('theme.light')}</span>
                  </>
                ) : (
                  <>
                    <MoonIcon />
                    <span className={`${isRTL ? 'mr-2' : 'ml-2'}`}>{t('theme.dark')}</span>
                  </>
                )}
              </button>

              <button
                onClick={toggleLanguage}
                className="px-4 py-2 text-sm text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-full transition-colors shadow-sm"
              >
                {locale === 'en' ? 'العربية' : 'English'}
              </button>
            </div>
            
            <div className="flex items-center mt-3 justify-between">
              {session ? (
                <button
                  onClick={signOut}
                  className="px-4 py-2 text-sm text-white bg-red-400 hover:bg-red-500 rounded-full transition-colors shadow-sm"
                >
                  {t('auth.signOut')}
                </button>
              ) : (
                <Link
                  href={`/${locale}/auth/login`}
                  className="px-4 py-2 text-sm text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-full transition-colors shadow-sm"
                >
                  {t('auth.signIn')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}