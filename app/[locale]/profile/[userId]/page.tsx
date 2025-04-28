'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { useSession } from '@/contexts/SessionContext'
import { useLocale } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'

const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, regions(*)')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

const fetchUserPosts = async (userId: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!user_id (full_name, avatar_url),
      category:categories!posts_category_id_fkey (name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export default function UserProfilePage() {
  const queryClient = useQueryClient()
  const params = useParams()
  const userId = params.userId as string
  const { session } = useSession()
  const currentUserId = session?.user?.id
  const locale = useLocale()

  // Use React Query hooks
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError
  } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchUserProfile(userId),
    enabled: !!userId
  })

  const {
    data: userPosts = [],
    isLoading: isPostsLoading,
    error: postsError
  } = useQuery({
    queryKey: ['userPosts', userId],
    queryFn: () => fetchUserPosts(userId),
    enabled: !!userId
  })

  // Handle errors
  useEffect(() => {
    if (profileError) {
      toast.error('Failed to load user profile')
    }
    if (postsError) {
      toast.error('Failed to load user posts')
    }
  }, [profileError, postsError])

  const { data: followerCount = 0 } = useQuery({
    queryKey: ['follower-count', userId],
    queryFn: async () => {
      if (!userId) return 0

      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId)

      if (error) throw error
      return count || 0
    },
    enabled: !!userId
  })

  // Following Count Query
  const { data: followingCount = 0 } = useQuery({
    queryKey: ['following-count', userId],
    queryFn: async () => {
      if (!userId) return 0

      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId)

      if (error) throw error
      return count || 0
    },
    enabled: !!userId
  })
  const { data: isFollowing = false } = useQuery({
    queryKey: ['isFollowing', userId, currentUserId],
    queryFn: async () => {
      if (!currentUserId || !userId) return false

      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', currentUserId)
        .eq('following_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return false // No record found
        }
        throw error
      }
      return !!data
    },
    enabled: !!currentUserId && !!userId && currentUserId !== userId
  })

  const handleFollow = async () => {
    if (!currentUserId) {
      toast.error('Please login to follow users')
      return
    }

    if (currentUserId === userId) {
      return
    }

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', userId)

        if (error) throw error

        // Batch invalidate queries
        await queryClient.invalidateQueries({
          predicate: (query) => 
            query.queryKey[0] === 'follower-count' ||
            query.queryKey[0] === 'isFollowing'
        })
        
        toast.success('Unfollowed successfully')
      } else {
        // Check if the relationship already exists
        const { data: existingFollow } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', currentUserId)
          .eq('following_id', userId)
          .single()

        if (!existingFollow) {
          const { error } = await supabase
            .from('follows')
            .insert({
              follower_id: currentUserId,
              following_id: userId,
              created_at: new Date().toISOString()
            })

          if (error) throw error

          // Batch invalidate queries
          await queryClient.invalidateQueries({
            predicate: (query) => 
              query.queryKey[0] === 'follower-count' ||
              query.queryKey[0] === 'isFollowing'
          })
          
          toast.success('Followed successfully')
        }
      }
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
              <div className="h-6 bg-gray-200  rounded w-1/4 mb-3"></div>
              <div className="h-4 bg-gray-200  rounded w-1/3"></div>
            </div>
          </div>
          <div className="h-4 bg-gray-200  rounded w-full mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-200  rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className=" rounded-xl shadow-sm  p-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h2 className="text-xl font-bold  mb-2">User not found</h2>
          <p className="text-gray-500  mb-4">The user you're looking for doesn't exist or has been removed.</p>
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
      <div className=" rounded-xl shadow-sm  overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
            <div>
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile picture"
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover border-2 border-white  shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold border-2 border-white  shadow-sm">
                  {profile.full_name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-1">
                {profile.full_name || 'User'}
              </h1>
              
              {profile.regions && (
                <div className="mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                    {profile.regions.name}
                  </span>
                </div>
              )}
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-4">
                <div className="text-center">
                  <span className="block text-xl font-bold ">{userPosts.length}</span>
                  <span className="text-sm text-gray-500 ">Posts</span>
                </div>
                <div className="text-center">
                  <span className="block text-xl font-bold ">{followerCount}</span>
                  <span className="text-sm text-gray-500 ">Followers</span>
                </div>
                <div className="text-center">
                  <span className="block text-xl font-bold ">{followingCount}</span>
                  <span className="text-sm text-gray-500 ">Following</span>
                </div>
              </div>
              {currentUserId && currentUserId !== userId && (
                <button
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    isFollowing
                      ? 'bg-gray-200  text-gray-800  hover:bg-gray-300 '
                      : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
                  }`}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
          </div>

          {profile.bio && (
            <p className="text-gray-700  mb-4">{profile.bio}</p>
          )}
        </div>
      </div>

      <h2 className="text-xl font-bold  mb-4">Posts</h2>

      {userPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userPosts.map(post => (
            <Link key={post.id} href={`/${locale}/posts/${post.id}`}>
              <div className=" rounded-xl shadow-sm  overflow-hidden hover:shadow-md transition-shadow">
                {post.media_url && (
                  <div className="h-48 overflow-hidden">
                    {post.media_url.includes('bing.com') ? (
                      <img
                        src={post.media_url}
                        alt="Post media content"
                        className="w-full h-auto object-cover max-h-[500px]"
                      />
                    ) : (
                      <Image
                        src={post.media_url}
                        width={800}
                        height={600}
                        alt="Post media content"
                        className="w-full h-auto object-cover max-h-[500px]"
                        unoptimized={post.media_url.startsWith('data:') || post.media_url.includes('blob:') ? 'true' : undefined}
                      />
                    )}
                  </div>
                )}
                <div className="p-4">
                  <p className="text-gray-500  text-sm mb-2">
                    {new Date(post.created_at).toLocaleDateString()}
                    {post.category && (
                      <span className="ml-2 px-2 py-1 bg-purple-100  text-purple-600  rounded-full text-xs">
                        {post.category.name}
                      </span>
                    )}
                  </p>
                  <p className="text-gray-800  line-clamp-3">{post.content}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className=" rounded-xl shadow-sm  p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <h3 className="text-lg font-medium  mb-2">No posts yet</h3>
          <p className="text-gray-500 ">This user hasn't created any posts yet.</p>
        </div>
      )}
    </div>
  )
}
