'use client'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useSession } from '@/contexts/SessionContext'
import { 
  HomeIcon, 
  ExploreIcon, 
  NotificationIcon, 
  ProfileIcon, 
  CreateIcon 
} from '@/components/icons/Icons'
import NotificationBadge from '@/components/NotificationBadge'

export default function MobileNavigation() {
  const locale = useLocale();
  const t = useTranslations('sidebar.nav');
  const {session} = useSession()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[hsl(var(--background))] border-t border-[hsl(var(--border))] z-40">
      <div className="flex justify-around items-center h-16">
        <Link href={`/${locale}`} className="flex flex-col items-center justify-center text-[hsl(var(--primary))]">
          <HomeIcon />
          <span className="text-xs mt-1">{t('home')}</span>
        </Link>

        <Link href={`/${locale}/search`} className="flex flex-col items-center justify-center text-[hsl(var(--muted-foreground))]">
          <ExploreIcon />
          <span className="text-xs mt-1">{t('explore')}</span>
        </Link>
        {session && (
          <Link href={`/${locale}/posts/create`} className="flex flex-col items-center justify-center -mt-6">
            <div className="bg-[hsl(var(--primary))] p-3 rounded-full text-white">
              <CreateIcon />
            </div>
            <span className="text-xs mt-1 text-[hsl(var(--muted-foreground))]">{t('create_post').split(' ')[0]}</span>
          </Link>
        )}

        <Link href={`/${locale}/notifications`} className="flex flex-col items-center justify-center text-[hsl(var(--muted-foreground))] relative">
          <NotificationIcon />
          <NotificationBadge />
          <span className="text-xs mt-1">{t('notifications')}</span>
        </Link>

        <Link href={`/${locale}/profile`} className="flex flex-col items-center justify-center text-[hsl(var(--muted-foreground))]">
          <ProfileIcon />
          <span className="text-xs mt-1">{t('profile')}</span>
        </Link>
      </div>
    </nav>
  )
}