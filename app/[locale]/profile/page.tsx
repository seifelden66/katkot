'use client'
import { useSession } from '@/contexts/SessionContext'
import { supabase } from '@/lib/supabaseClient'
// import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { toast } from 'react-toastify'
import { useQuery } from '@tanstack/react-query'

export default function ProfilePage() {
  const { session } = useSession()
  const locale    = useLocale()
  const userId    = session?.user?.id

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('*, regions(*)')
        .eq('id', userId)
        .single()
      if (error) {
        toast.error('Failed to load profile')
        throw error
      }
      return data
    },
    enabled: !!userId,
    refetchOnMount: 'always'
  })

  const { data: userPosts = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ['user-posts', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!user_id (full_name, avatar_url),
          category:categories!posts_category_id_fkey (name),
          store_name,
          description
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) {
        toast.error('Failed to load posts')
        throw error
      }
      return data || []
    },
    enabled: !!userId
  })

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

  if (isProfileLoading || isPostsLoading) {
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
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-gray-200  rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200  overflow-hidden flex-shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'User'}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {profile?.full_name || 'User'}
              </h1>
              
              {profile?.regions && (
                <div className="mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                    {profile.regions.name}
                  </span>
                </div>
              )}
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-4">
                <div className="text-center">
                  <span className="block text-xl font-bold text-gray-900 ">{userPosts.length}</span>
                  <span className="text-sm">Posts</span>
                </div>
                <div className="text-center">
                  <span className="block text-xl font-bold">{followerCount}</span>
                  <span className="text-sm text-gray-500 ">Followers</span>
                </div>
                <div className="text-center">
                  <span className="block text-xl font-bold">{followingCount}</span>
                  <span className="text-sm text-gray-500 ">Following</span>
                </div>
              </div>
              {profile?.bio && (
                <p className="text-gray-700  mb-4 max-w-lg">{profile.bio}</p>
              )}
              <Link
                href={`/${locale}/profile/edit`}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
      <h2 className="text-xl font-bold text-gray-900  mb-4">Posts</h2>
      {userPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userPosts.map(post => (
            <Link key={post.id} href={`/${locale}/posts/${post.id}`}>
              <div className="rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {post.media_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={post.media_url}
                      width={800}
                      height={600}
                      alt="Post media"
                      className="w-full h-auto object-cover max-h-[500px]"
                      // unoptimized={post.media_url.startsWith('data:') || post.media_url.includes('blob:')}
                    />
                  </div>
                )}
                <div className="p-4">
                  {post.store_name && (
                    <div className="flex items-center mb-2">
                      <span className="font-semibold text-blue-600 ">{post.store_name}</span>
                      <span className="ml-2 px-2 py-1 bg-blue-100  text-blue-600  rounded-full text-xs">Store</span>
                    </div>
                  )}
                  <p className="text-gray-500  text-sm mb-2">
                    {new Date(post.created_at).toLocaleDateString()}
                    {post.category && (
                      <span className="ml-2 px-2 py-1 bg-purple-100  text-purple-600  rounded-full text-xs">
                        {post.category.name}
                      </span>
                    )}
                  </p>
                  <p className="text-gray-800  line-clamp-3">{post.content}</p>
                  {post.description && (
                    <div className="mt-3 pt-3 border-t border-gray-100 ">
                      {post.description.includes('<img') || post.description.includes('<video') ? (
                        <span>Rich media content available...</span>
                      ) : (
                        <p className="rich-content line-clamp-2 text-sm text-gray-600 ">{post.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl shadow-sm p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <h3 className="text-lg font-medium mb-2">No posts yet</h3>
          <p className="text-gray-500 ">This user hasn&apos;t created any posts yet.</p>
        </div>
      )}
    </div>
  )
}
