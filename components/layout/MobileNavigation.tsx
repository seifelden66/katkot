'use client'
import Link from 'next/link'
import { HomeIcon, ExploreIcon, CreateIcon, NotificationIcon, ProfileIcon } from '@/components/icons/Icons'
import { Session } from '@supabase/supabase-js'
import { useLocale, useTranslations } from 'next-intl';

type MobileNavigationProps = {
  session: Session | null;
}

export default function MobileNavigation({ session }: MobileNavigationProps) {
  const locale = useLocale();
  const t = useTranslations('sidebar.nav');
  
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t dark:border-gray-800 z-40">
      <div className="flex justify-around items-center h-16">
        <Link href={`/${locale}`} className="flex flex-col items-center justify-center text-blue-500">
          <HomeIcon />
          <span className="text-xs mt-1">{t('home')}</span>
        </Link>

        <Link href={`/${locale}/search`} className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <ExploreIcon />
          <span className="text-xs mt-1">{t('explore')}</span>
        </Link>

        {session && (
          <Link href={`/${locale}/posts/create`} className="flex flex-col items-center justify-center -mt-6">
            <div className="bg-blue-500 p-3 rounded-full text-white">
              <CreateIcon />
            </div>
            <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">{t('create_post').split(' ')[0]}</span>
          </Link>
        )}

        <Link href={`/${locale}/notifications`} className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <NotificationIcon />
          <span className="text-xs mt-1">{t('notifications')}</span>
        </Link>

        <Link href={`/${locale}/profile`} className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <ProfileIcon />
          <span className="text-xs mt-1">{t('profile')}</span>
        </Link>
      </div>
    </nav>
  )
}