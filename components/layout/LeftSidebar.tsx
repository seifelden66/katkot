'use client'
import Link from 'next/link'
import UserGreeting from '@/components/UserGreeting'
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
} from '@/components/icons/Icons'


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
    name: 'Explore',
    href: '/search',
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
  const { session, logout } = useSession()  

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
      className={`fixed lg:sticky top-0 h-screen lg:flex flex-col w-72 border-r ${darkMode ? 'border-gray-800' : 'border-gray-200'} z-30 transform transition-transform duration-300 ease-in-out overflow-y-auto
      ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className={`flex flex-col h-full pt-20 lg:p-6 ${darkMode ? 'bg-gray-900 lg:bg-inherit' : 'bg-gray-200 lg:bg-inherit'}`}>
        <div className="hidden lg:flex items-center gap-2 mb-10">
          <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">Katkot</span>
        </div>

        <nav className="space-y-3 mb-8">
          {navLinks.map((link, index) => {
            if (link.requiresAuth && !session) return null;
            const isCreatePost = link.name === 'Create Post';
            
            return (
              <Link
                key={index}
                href={`/${locale}${link.href}`}
                className={
                  isCreatePost 
                    ? "flex items-center px-5 py-3 mt-6 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full transition-colors shadow-md"
                    : `flex items-center px-5 py-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'} rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-purple-50'} transition-colors`
                }
              >
                <div className={isCreatePost ? '' : `${darkMode ? 'bg-gray-800' : 'bg-purple-100'} p-2 rounded-full`}>
                  {link.icon}
                </div>
                <span className={`text-base font-medium ${isCreatePost ? 'ml-3' : 'ml-4'} ${isRTL ? 'mr-4 ml-0' : ''}`}>
                  {t(`nav.${link.name.toLowerCase().replace(' ', '_')}`)}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className={`rounded-2xl p-4 shadow-sm`}>
            <UserGreeting />

            <div className="flex items-center mt-4 justify-between">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`flex items-center px-4 py-2 text-sm ${darkMode ? 'text-gray-200 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-white hover:bg-gray-100'} rounded-full transition-colors shadow-sm`}
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
              {/* {session?.user.email} */}
              {session ? (
                <button
                  onClick={logout}
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