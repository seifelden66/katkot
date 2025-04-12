'use client'
import { useEffect, useState } from 'react'
import { useSession } from '@/contexts/SessionContext'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { session } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [userPosts, setUserPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Redirect if not logged in
    if (session === null) {
      router.push('/auth/login')
      return
    }

    const fetchProfile = async () => {
      if (!session?.user?.id) return

      setLoading(true)
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        toast.error('Failed to load profile')
        setLoading(false)
        return
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
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (postsError) {
        console.error('Error fetching posts:', postsError)
      } else {
        setUserPosts(postsData || [])
      }

      setLoading(false)
    }

    fetchProfile()
  }, [session, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full "></div>
            <div className="flex-1">
              <div className="h-6  rounded w-1/4 mb-3"></div>
              <div className="h-4  rounded w-1/3"></div>
            </div>
          </div>
          <div className="h-4  rounded w-full mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40  rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name || 'User'}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center ">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{profile?.full_name || 'User'}</h1>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-4">
                <div className="text-center">
                  <span className="block text-xl font-bold text-gray-900 dark:text-white">{userPosts.length}</span>
                  <span className="text-sm ">Posts</span>
                </div>
                {/* Other stats */}
              </div>
              
              {profile?.bio && (
                <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-lg">{profile.bio}</p>
              )}
              
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Posts</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Post grid items */}
      </div>
    </div>
  )
}