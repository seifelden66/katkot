'use client'
import { useSession } from '@/contexts/SessionContext'
import { useLocale, useTranslations } from 'next-intl'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'react-toastify'
import Image from 'next/image'
import Link from 'next/link'
import CategoryFilter from '@/components/CategoryFilter'
import StoreFilter from '@/components/StoreFilter'
import { SearchIcon } from '@/components/icons/Icons'
import { useUsersToFollow, useSearch } from '@/app/hooks/queries/usePostQueries'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

// Add these type definitions at the top of the file, after the imports
interface User {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface SearchResults {
  users: User[];
  posts: Post[];
}

export default function RightSidebar() {
  const { session } = useSession()
  const locale = useLocale()
  const t = useTranslations('sidebar.search')
  const queryClient = useQueryClient()
  const router = useRouter()
  const currentUserId = session?.user?.id

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const { data: usersToFollow = [] } = useUsersToFollow(currentUserId)
  // Update the type annotation for searchResults
  const { data: searchResults, isLoading: isSearching } = useSearch(debouncedQuery) as { 
    data: SearchResults | undefined; 
    isLoading: boolean 
  };

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearchFocus = () => {
    if (debouncedQuery.trim().length >= 2) setShowResults(true)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim().length >= 2) {
      router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery)}`)
      setShowResults(false)
    }
  }

  const { mutate: followUser } = useMutation({
    mutationFn: async (userId: string) => {
      if (!currentUserId) throw new Error('Must be logged in to follow')
      const { error } = await supabase.from('follows').insert({
        follower_id: currentUserId,
        following_id: userId
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-to-follow'] })
      toast.success(t('followSuccess'))
    },
    onError: (err: Error) => {
      toast.error(t('followError') + err.message)
    }
  })

  const handleFollow = (userId: string) => {
    if (!currentUserId) {
      toast.error(t('mustBeLoggedIn'))
      return
    }
    followUser(userId)
  }

  return (
    <aside className="hidden xl:block p-6 sticky top-0 h-screen overflow-y-auto">
      <div className="mb-8" ref={searchRef}>
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder={t('placeholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={handleSearchFocus}
            className="w-full pl-10 pr-4 py-3 border-none rounded-full bg-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </form>

        {showResults && debouncedQuery.trim().length >= 2 && (
          <div className="absolute mt-2 w-full max-w-md bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center text-gray-500">{t('loading')}</div>
            ) : searchResults && (
              searchResults.users.length > 0 || searchResults.posts.length > 0
            ) ? (
              <>
                {searchResults.users.length > 0 && (
                  <div className="p-2">
                    <h3 className="text-sm font-semibold text-gray-500 px-3 py-1">
                      {t('users')}
                    </h3>
                    {searchResults.users.slice(0, 3).map(user => (
                      <Link
                        key={user.id}
                        href={`/${locale}/profile/${user.id}`}
                        onClick={() => setShowResults(false)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          {user.avatar_url ? (
                            <Image
                              src={user.avatar_url}
                              alt={user.full_name + ' avatar'}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                              {user.full_name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-sm text-gray-500">
                            @{user.id.slice(0, 8)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {searchResults.posts.length > 0 && (
                  <div className="p-2">
                    <h3 className="text-sm font-semibold text-gray-500 px-3 py-1">
                      {t('posts')}
                    </h3>
                    {searchResults.posts.slice(0, 3).map(post => (
                      <Link
                        key={post.id}
                        href={`/${locale}/posts/${post.id}`}
                        onClick={() => setShowResults(false)}
                        className="block p-3 hover:bg-gray-100 rounded-lg"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            {post.author && post.author.avatar_url ? (
                              <Image
                                src={post.author.avatar_url}
                                alt={post.author.full_name + ' avatar'}
                                width={32}
                                height={32}
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                {post.author?.full_name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <p className="font-medium">{post.author?.full_name}</p>
                        </div>
                        <p className="text-sm line-clamp-2">{post.content}</p>
                      </Link>
                    ))}
                  </div>
                )}

                {(searchResults.users.length > 3 || searchResults.posts.length > 3) && (
                  <div className="p-3 text-center border-t">
                    <Link
                      href={`/${locale}/search?q=${encodeURIComponent(debouncedQuery)}`}
                      onClick={() => setShowResults(false)}
                      className="text-blue-500 hover:underline"
                    >
                      {t('viewAll')}
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-center text-gray-500">
                {t('noResults')} “{debouncedQuery}”
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">{t('filterByCategory')}</h3>
        <CategoryFilter />
      </div>
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">{t('filterByStore')}</h3>
        <StoreFilter />
      </div>

      
      <div className="rounded-2xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">{t('whoToFollow')}</h3>
        <div className="space-y-5">
          {usersToFollow.map(user => (
            <div key={user.id} className="flex items-center justify-between">
              <Link href={`/${locale}/profile/${user.id}`} className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={user.full_name + ' avatar'}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                      {user.full_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{user.full_name}</p>
                  <p className="text-sm text-gray-500">
                    @{user.id.slice(0, 8)}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => handleFollow(user.id)}
                className="px-4 py-2 text-sm bg-purple-100 text-purple-600 rounded-full font-medium hover:bg-purple-200 transition-colors"
              >
                {t('follow')}
              </button>
            </div>
          ))}
          {usersToFollow.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              {currentUserId ? t('noSuggestions') : t('signInToSee')}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
