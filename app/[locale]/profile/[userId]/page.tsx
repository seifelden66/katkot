'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { useSession } from '@/contexts/SessionContext'
import { useLocale } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'
import {
  useUserProfile,
  useUserPosts,
  useFollowerCount,
  useFollowingCount,
  useIsFollowing,
  
  useFollowersList, 
  useFollowingList
} from '@/app/hooks/queries/usePostQueries'
import { supabase } from '@/lib/supabaseClient'
import ProfileHeader from './components/ProfileHeader'
import ProfilePosts from './components/ProfilePosts'
import FollowersModal from './components/FollowersModal'
import Link from 'next/link'

export default function UserProfilePage() {
  const queryClient = useQueryClient()
  const params = useParams()
  const userId = params.userId as string
  const { session } = useSession()
  const currentUserId = session?.user?.id
  const locale = useLocale()
  const [view, setView] = useState<"none" | "followers" | "following">("none")

  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError
  } = useUserProfile(userId)

  const { data: followers = [], isLoading: loadingFollowers } = useFollowersList(userId)
  const { data: following = [], isLoading: loadingFollowing } = useFollowingList(userId)
  
  const {
    data: userPosts = [],
    isLoading: isPostsLoading,
    error: postsError
  } = useUserPosts(userId)

  useEffect(() => {
    if (profileError) {
      toast.error('Failed to load user profile')
    }
    if (postsError) {
      toast.error('Failed to load user posts')
    }
  }, [profileError, postsError])

  const { data: followerCount = 0 } = useFollowerCount(userId)
  const { data: followingCount = 0 } = useFollowingCount(userId)
  const { data: isFollowing = false } = useIsFollowing(userId, currentUserId)
  
  const handleFollow = async (targetUserId = userId) => {
    if (!currentUserId) {
      toast.error('Please login to follow users')
      return
    }

    if (currentUserId === targetUserId) {
      return
    }

    try {
      const { data } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .single()
      
      const isAlreadyFollowing = !!data

      if (isAlreadyFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', targetUserId)

        if (error) throw error

        toast.success('Unfollowed successfully')
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUserId,
            following_id: targetUserId,
            created_at: new Date().toISOString()
          })

        if (error) throw error

        toast.success('Followed successfully')
      }

      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'follower-count' ||
          query.queryKey[0] === 'following-count' ||
          query.queryKey[0] === 'isFollowing' ||
          query.queryKey[0] === 'existingFollow' ||
          query.queryKey[0] === 'followers-list' ||
          query.queryKey[0] === 'following-list'
      })
    } catch (error) {
      console.error('Error following/unfollowing:', error)
      toast.error('Failed to update follow status')
    }
  }

  const loading = isProfileLoading || isPostsLoading

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gray-200 "></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="rounded-xl shadow-sm p-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">User not found</h2>
          <p className="text-gray-500 mb-4">The user you are looking for does not exist or has been removed.</p>
          <Link
            href={`/${locale}/`}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full transition-colors shadow-md inline-flex items-center"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader 
        profile={profile}
        userPosts={userPosts}
        followerCount={followerCount}
        followingCount={followingCount}
        isFollowing={isFollowing}
        currentUserId={currentUserId}
        userId={userId}
        handleFollow={handleFollow}
        setView={setView}
      />

      <h2 className="text-xl font-bold mb-4">Posts</h2>
      
      <ProfilePosts 
        userPosts={userPosts} 
        locale={locale} 
      />

      {view !== "none" && (
        <FollowersModal
          view={view}
          setView={setView}
          followers={followers}
          following={following}
          loadingFollowers={loadingFollowers}
          loadingFollowing={loadingFollowing}
          locale={locale}
          currentUserId={currentUserId}
          handleFollow={handleFollow}
        />
      )}
    </div>
  )
}
