'use client'
import { useSelector } from 'react-redux'
import type { RootState } from '@/lib/store'
import { useSession } from '@/contexts/SessionContext'
import { supabase } from '@/lib/supabaseClient'
import PostCard from '@/components/PostCard'
import { ShimmerEffect } from '@/components/PostCard'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useLocale } from 'next-intl'

export default function HomePage() {
  const router = useRouter()
  const locale = useLocale()
  const { session } = useSession()
  const selectedCategory = useSelector((state: RootState) => state.filter.selectedCategory)
  const selectedStore = useSelector((state: RootState) => state.filter.selectedStore)
  
  const { data: allReactions = {} } = useQuery({
    queryKey: ['reactions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('reactions')
        .select('post_id, type, user_id')

      const grouped = data?.reduce((acc, reaction) => {
        acc[reaction.post_id] = [...(acc[reaction.post_id] || []), reaction]
        return acc
      }, {} as Record<string, any[]>)
      
      return grouped || {}
    }
  })

  const { data: commentsData = [] } = useQuery({
    queryKey: ['comments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles:user_id(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Group comments by post_id
      const groupedComments = data?.reduce((acc, comment) => {
        if (!acc[comment.post_id]) {
          acc[comment.post_id] = [];
        }
        acc[comment.post_id].push(comment);
        return acc;
      }, {} as Record<string, any[]>);
      
      return groupedComments || {}
    }
  })

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', selectedCategory, selectedStore],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles!user_id (full_name, avatar_url),
          category:categories!posts_category_id_fkey (name)
        `)
        .order('created_at', { ascending: false })

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory)
      }
      
      if (selectedStore) {
        query = query.eq('store_id', selectedStore)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    }
  })

  

  const handlePostClick = (postId: string) => {
    router.push(`/${locale}/posts/${postId}`)
  }

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <ShimmerEffect key={i} />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <div 
              key={post.id}
              // onClick={() => handlePostClick(post.id)}
              className="cursor-pointer transition-transform hover:scale-[1.01] focus:outline-none"
            >
              <PostCard
                post={post}
                reactions={allReactions[post.id] || []}
                comments={commentsData[post.id] || []}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-purple-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No posts found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            {selectedCategory 
              ? "There are no posts in this category yet. Try selecting a different category."
              : "There are no posts yet. Be the first to create one!"}
          </p>
          {session && (
            <button 
              onClick={() => router.push(`/${locale}/posts/create`)}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full transition-colors shadow-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create a post
            </button>
          )}
        </div>
      )}
    </div>
  )
}
