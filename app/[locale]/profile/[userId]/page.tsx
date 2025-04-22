'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { useSession } from '@/contexts/SessionContext'
import { useLocale } from 'next-intl';


export default function UserProfilePage() {
  const params = useParams()
  const userId = params.userId as string
  const { session } = useSession()
  const currentUserId = session?.user?.id
  const [profile, setProfile] = useState<any>(null)
  const [userPosts, setUserPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const locale = useLocale()

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (profileError) {
          throw profileError
        }

        setProfile(profileData)

        // Fetch user posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            author:profiles!user_id (full_name, avatar_url),
            category:categories!posts_category_id_fkey (name)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (postsError) {
          console.error('Error fetching posts:', postsError)
        } else {
          setUserPosts(postsData || [])
        }

        // For future implementation: fetch follower/following counts
        setFollowerCount(0)
        setFollowingCount(0)
        
        // For future implementation: check if current user is following this user
        setIsFollowing(false)
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast.error('Failed to load user profile')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserData()
    }
  }, [userId])

  const handleFollow = async () => {
    if (!currentUserId) {
      toast(
        <div className="flex flex-col">
          <p className="mb-2">You need to be logged in to follow users</p>
          <Link 
            href={`${locale}/auth/login`}
            className="self-start bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium"
          >
            Sign in
          </Link>
        </div>,
        {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
        }
      )
      return
    }

    // For future implementation: toggle follow status
    setIsFollowing(!isFollowing)
    toast.success(isFollowing ? 'Unfollowed user' : 'Following user')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
          <p className="text-gray-500 dark:text-gray-400 mb-4">The user you're looking for doesn't exist or has been removed.</p>
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
                <Image
                  src={profile.avatar_url}
                  alt="Profile picture"
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold border-2 border-white dark:border-gray-700 shadow-sm">
                  {profile.full_name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold  mb-1">
                {profile.full_name || 'User'}
              </h1>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-4">
                <div className="text-center">
                  <span className="block text-xl font-bold ">{userPosts.length}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Posts</span>
                </div>
                <div className="text-center">
                  <span className="block text-xl font-bold ">{followerCount}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Followers</span>
                </div>
                <div className="text-center">
                  <span className="block text-xl font-bold ">{followingCount}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Following</span>
                </div>
              </div>
              
              {currentUserId && currentUserId !== userId && (
                <button
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    isFollowing 
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                      : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>
          
          {profile.bio && (
            <p className="text-gray-700 dark:text-gray-300 mb-4">{profile.bio}</p>
          )}
        </div>
      </div>
      
      <h2 className="text-xl font-bold  mb-4">Posts</h2>
      
      {userPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userPosts.map(post => (
            <Link key={post.id} href={`${locale}/posts/${post.id}`}>
              <div className=" rounded-xl shadow-sm  overflow-hidden hover:shadow-md transition-shadow">
                {post.media_url && (
                  <div className="h-48 overflow-hidden">
                    <Image
                      src={post.media_url}
                      alt="Post image"
                      width={400}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                    {new Date(post.created_at).toLocaleDateString()}
                    {post.category && (
                      <span className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs">
                        {post.category.name}
                      </span>
                    )}
                  </p>
                  <p className="text-gray-800 dark:text-gray-200 line-clamp-3">{post.content}</p>
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
          <p className="text-gray-500 dark:text-gray-400">This user hasn't created any posts yet.</p>
        </div>
      )}
    </div>
  )
}