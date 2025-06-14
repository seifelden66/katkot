'use client'
import { useSession } from '@/contexts/SessionContext'
import { useUserProfile } from '@/app/hooks/queries/usePostQueries'
import { useIsMounted } from '@/hooks/useIsMounted'

export default function UserGreeting() {
  const { session } = useSession()
  const { data: userProfile } = useUserProfile(session?.user?.id)
  const isMounted = useIsMounted()
  
  if (!isMounted) {
    return <div className="text-sm font-medium text-gray-700">Loading...</div>
  }

  return (
    <div className="text-sm font-medium text-gray-700">
      <div>Hi, {userProfile?.full_name || 'Guest'} 👋</div>
      {userProfile && (
        <div className="mt-1 text-xs font-semibold text-purple-600">
          {userProfile?.points_balance} points available
        </div>
      )}
    </div>
  )
}