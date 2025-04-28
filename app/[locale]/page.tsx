'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import PostCard from '@/components/PostCard'
import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/contexts/SessionContext'
import { useLocale } from 'next-intl'

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedStore, setSelectedStore] = useState<number | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [stores, setStores] = useState<any[]>([])
  const { session } = useSession()
  const locale = useLocale()

  useEffect(() => {
    const fetchFilters = async () => {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (categoriesData) {
        setCategories(categoriesData)
      }
      
      // Fetch stores
      const { data: storesData } = await supabase
        .from('stores')
        .select('*')
        .order('name')
      
      if (storesData) {
        setStores(storesData)
      }
    }
    
    fetchFilters()
  }, [])

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null
      
      const { data, error } = await supabase
        .from('profiles')
        .select('region_id')
        .eq('id', session.user.id)
        .single()
        
      if (error) throw error
      return data
    },
    enabled: !!session?.user?.id
  })

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', selectedCategory, selectedStore, userProfile?.region_id],
    queryFn: async () => {
      // First get user's region posts
      let userRegionPosts: any[] = []
      let otherRegionPosts: any[] = []
      
      // Base query
      let baseQuery = supabase
        .from('posts')
        .select(`
          *,
          author:profiles!user_id (full_name, avatar_url),
          category:categories!posts_category_id_fkey (name),
          region:regions!posts_region_id_fkey (name, code)
        `)
      
      // Apply filters
      if (selectedCategory) {
        baseQuery = baseQuery.eq('category_id', selectedCategory)
      }
      
      if (selectedStore) {
        baseQuery = baseQuery.eq('store_id', selectedStore)
      }
      
      // If user is logged in and has a region, prioritize that region's posts
      if (session?.user?.id && userProfile?.region_id) {
        // Get posts from user's region or global
        const { data: regionPosts, error: regionError } = await baseQuery
          .or(`region_id.eq.${userProfile.region_id},region_id.eq.1`) // User's region or global
          .order('created_at', { ascending: false })
        
        if (!regionError && regionPosts) {
          userRegionPosts = regionPosts
        }
        
        // Get posts from other regions
        const { data: otherPosts, error: otherError } = await baseQuery
          .not('region_id', 'in', `(${userProfile.region_id},1)`) // Not user's region and not global
          .order('created_at', { ascending: false })
        
        if (!otherError && otherPosts) {
          otherRegionPosts = otherPosts
        }
        
        // Combine with user's region posts first
        return [...userRegionPosts, ...otherRegionPosts]
      } else {
        // If no user or no region, just get all posts
        const { data, error } = await baseQuery.order('created_at', { ascending: false })
        if (error) throw error
        return data || []
      }
    }
  })

  // Fetch reactions for all posts
  const { data: allReactions = {} } = useQuery({
    queryKey: ['allReactions', posts],
    queryFn: async () => {
      if (!posts.length) return {}
      
      const postIds = posts.map(post => post.id)
      const { data, error } = await supabase
        .from('reactions')
        .select('*')
        .in('post_id', postIds)
      
      if (error) throw error
      
      // Group reactions by post_id
      const groupedReactions: Record<string, any[]> = {}
      data?.forEach(reaction => {
        if (!groupedReactions[reaction.post_id]) {
          groupedReactions[reaction.post_id] = []
        }
        groupedReactions[reaction.post_id].push(reaction)
      })
      
      return groupedReactions
    },
    enabled: posts.length > 0
  })

  // Fetch comments for all posts
  const { data: commentsData = {} } = useQuery({
    queryKey: ['allComments', posts],
    queryFn: async () => {
      if (!posts.length) return {}
      
      const postIds = posts.map(post => post.id)
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles!user_id (full_name, avatar_url)
        `)
        .in('post_id', postIds)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      
      // Group comments by post_id
      const groupedComments: Record<string, any[]> = {}
      data?.forEach(comment => {
        if (!groupedComments[comment.post_id]) {
          groupedComments[comment.post_id] = []
        }
        groupedComments[comment.post_id].push(comment)
      })
      
      return groupedComments
    },
    enabled: posts.length > 0
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1 rounded-full text-sm ${
            selectedCategory === null
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          All Categories
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedStore(null)}
          className={`px-3 py-1 rounded-full text-sm ${
            selectedStore === null
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          All Stores
        </button>
        {stores.map(store => (
          <button
            key={store.id}
            onClick={() => setSelectedStore(selectedStore === store.id ? null : store.id)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedStore === store.id
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {store.name}
          </button>
        ))}
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-40 bg-gray-200 rounded-xl mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <div 
              key={post.id}
              className="cursor-pointer transition-transform hover:scale-[1.01] focus:outline-none"
            >
              {post.region && post.region.code !== 'global' && (
                <div className="mb-1 text-xs text-right">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                    {post.region.name}
                  </span>
                </div>
              )}
              <PostCard
                post={post}
                reactions={allReactions[post.id] || []}
                comments={commentsData[post.id] || []}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
          <p className="text-gray-500 mb-6">There are no posts matching your criteria.</p>
          <button
            onClick={() => {
              setSelectedCategory(null)
              setSelectedStore(null)
            }}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full transition-colors shadow-md inline-flex items-center"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  )
}
