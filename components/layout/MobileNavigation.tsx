'use client'
import Link from 'next/link'
import { Session } from '@supabase/supabase-js'
import { HomeIcon, ExploreIcon, CreateIcon, NotificationIcon, ProfileIcon } from '@/components/icons/Icons'

type MobileNavigationProps = {
  session: Session | null;
}

export default function MobileNavigation({ session }: MobileNavigationProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t dark:border-gray-800 z-40">
      <div className="flex justify-around items-center h-16">
        <Link href="/" className="flex flex-col items-center justify-center text-blue-500">
          <HomeIcon />
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link href="/search" className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <ExploreIcon />
          <span className="text-xs mt-1">Explore</span>
        </Link>

        {session && (
          <Link href="/create-post" className="flex flex-col items-center justify-center -mt-6">
            <div className="bg-blue-500 p-3 rounded-full text-white">
              <CreateIcon />
            </div>
            <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">Create</span>
          </Link>
        )}

        <Link href="/notifications" className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <NotificationIcon />
          <span className="text-xs mt-1">Alerts</span>
        </Link>

        <Link href="/profile" className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <ProfileIcon />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </nav>
  )
}