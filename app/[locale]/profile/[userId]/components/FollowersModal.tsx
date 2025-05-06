import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'

interface FollowersModalProps {
  view: "none" | "followers" | "following"
  setView: (view: "none" | "followers" | "following") => void
  followers: Array<{
    id: string;
    full_name: string;
    avatar_url?: string;
  }>
  following: Array<{
    id: string;
    full_name: string;
    avatar_url?: string;
  }>
  loadingFollowers: boolean
  loadingFollowing: boolean
  locale: string
  currentUserId: string | undefined
  handleFollow: (targetUserId: string) => Promise<void>
}

export default function FollowersModal({
  view,
  setView,
  followers,
  following,
  loadingFollowers,
  loadingFollowing,
  locale,
  currentUserId,
  handleFollow
}: FollowersModalProps) {
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({})
  
  useEffect(() => {
    const loadFollowStatus = async () => {
      if (!currentUserId) return
      
      const userList = view === "followers" ? followers : following
      
      const statusObj: Record<string, boolean> = {}
      
      for (const user of userList) {
        const { data } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', currentUserId)
          .eq('following_id', user.id)
          .single()
        
        statusObj[user.id] = !!data
      }
      
      setFollowStatus(statusObj)
    }
    
    loadFollowStatus()
  }, [view, followers, following, currentUserId])
  
  const handleFollowAction = async (targetUserId: string) => {
    if (!currentUserId) return
    
    await handleFollow(targetUserId)
    
    setFollowStatus(prev => ({
      ...prev,
      [targetUserId]: !prev[targetUserId]
    }))
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {view === "followers" ? "Followers" : "Following"}
          </h3>
          <button onClick={() => setView("none")} className="text-gray-500 hover:text-gray-700 cursor-pointer">✕</button>
        </div>
        <div className="space-y-3 h-64 overflow-auto">
          {view === "followers"
            ? loadingFollowers
              ? "Loading…"
              : followers.map((u) => (
                <div key={u.id} className="flex items-center justify-between hover:bg-gray-100 p-2 rounded">
                  <Link
                    href={`/${locale}/profile/${u.id}`}
                    className="flex items-center gap-3"
                  >
                    <Image
                      src={u.avatar_url || "/default-avatar.png"}
                      className="w-8 h-8 rounded-full"
                      alt={u.full_name}
                    />
                    <span>{u.full_name}</span>
                  </Link>
                  {currentUserId && currentUserId !== u.id && (
                    <button
                      onClick={() => handleFollowAction(u.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        followStatus[u.id]
                          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
                      }`}
                    >
                      {followStatus[u.id] ? 'Unfollow' : 'Follow Back'}
                    </button>
                  )}
                </div>
              ))
            : loadingFollowing
              ? "Loading…"
              : following.map((u) => (
                <div key={u.id} className="flex items-center justify-between hover:bg-gray-100 p-2 rounded">
                  <Link
                    href={`/${locale}/profile/${u.id}`}
                    className="flex items-center gap-3"
                  >
                    <Image
                      src={u.avatar_url || "/default-avatar.png"}
                      className="w-8 h-8 rounded-full"
                      alt={u.full_name}
                    />
                    <span>{u.full_name}</span>
                  </Link>
                  {currentUserId && currentUserId !== u.id && (
                    <button
                      onClick={() => handleFollowAction(u.id)}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                    >
                      Unfollow
                    </button>
                  )}
                </div>
              ))}
        </div>
      </div>
    </div>
  )
}