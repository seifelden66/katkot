'use client'
import { useSession } from '@/contexts/SessionContext'
import { useLocale } from 'next-intl'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'react-toastify'
import Image from 'next/image'
import Link from 'next/link'
import CategoryFilter from '@/components/CategoryFilter'
import StoreFilter from '@/components/StoreFilter'
import { SearchIcon } from '@/components/icons/Icons'
import { useUsersToFollow } from '@/app/hooks/queries/usePostQueries'

export default function RightSidebar() {
  const { session } = useSession()
  const locale = useLocale()
  const queryClient = useQueryClient()
  const currentUserId = session?.user?.id

  const { data: usersToFollow = [] } = useUsersToFollow(currentUserId)

  const { mutate: followUser } = useMutation({
    mutationFn: async (userId: string) => {
      if (!currentUserId) throw new Error('Must be logged in to follow')

      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: currentUserId,
          following_id: userId
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-to-follow'] })
      toast.success('Successfully followed user')
    },
    onError: (error) => {
      toast.error('Failed to follow user: ' + error.message)
    }
  })

  const handleFollow = (userId: string) => {
    if (!currentUserId) {
      toast.error('You must be logged in to follow users')
      return
    }
    followUser(userId)
  }

  return (
    <aside className="hidden xl:block p-6 sticky top-0 h-screen overflow-y-auto ">
      <div className="mb-8">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 ">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search Katkot"
            className="w-full pl-10 pr-4 py-3  border-none rounded-full bg-gray-300  placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Filter by Category</h3>
        <CategoryFilter />
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Filter by Store</h3>
        <StoreFilter />
      </div>
      
      <div className="rounded-2xl p-5 shadow-sm mb-8">
        <h3 className="text-lg font-semibold mb-4">Trending Topics</h3>
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start hover:bg-white p-3 rounded-xl transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 mr-3 flex items-center justify-center text-white font-bold">
                #{i}
              </div>
              <div>
                <p className="font-medium ">Trending Topic {i}</p>
                <p className="text-sm text-gray-500">{1.2 * i}K posts</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="rounded-2xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Who to Follow</h3>
        <div className="space-y-5">
          {usersToFollow.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <Link href={`/${locale}/profile/${user.id}`} className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={`${user.full_name}'s avatar`}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                      {user.full_name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{user.full_name}</p>
                  <p className="text-sm text-gray-500">@{user.username || user.id.slice(0, 8)}</p>
                </div>
              </Link>
              <button 
                onClick={() => handleFollow(user.id)}
                className="px-4 py-2 text-sm bg-purple-100  text-purple-600  rounded-full font-medium hover:bg-purple-200 transition-colors"
              >
                Follow
              </button>
            </div>
          ))}
          
          {usersToFollow.length === 0 && (
            <div className="text-center text-gray-500  py-4">
              {currentUserId ? 'No new users to follow' : 'Sign in to see suggested users'}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}