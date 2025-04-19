'use client'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import PostCard from '@/components/PostCard'
import { useEffect, useState, useCallback } from 'react'
// import RichContent from '@/components/RichContent'
import { Post, Profile } from '@/types/post'
interface Store {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Loading skeleton component
const PostSkeleton = () => (
  <div className="max-w-3xl mx-auto py-8 px-4 animate-pulse">
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md mb-6"></div>
    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
  </div>
)

interface PostWithAuthor extends Post {
  profiles: Profile;
}

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<PostWithAuthor | null>(null)
  const [comments, setComments] = useState<(Comment & { profiles: Profile })[]>([])
  const [store, setStore] = useState<Store | null>(null)
  const [nextPostId, setNextPostId] = useState<string | null>(null)
  const [prevPostId, setPrevPostId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoize fetch functions to prevent recreating on each render
  const fetchNextPostId = useCallback(async (currentId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id')
        .gt('id', currentId)
        .order('id', { ascending: true })
        .limit(1)
      
      if (error) throw error
      return data && data.length > 0 ? data[0].id : null
    } catch (err) {
      console.error('Error fetching next post:', err)
      return null
    }
  }, [])

  const fetchPreviousPostId = useCallback(async (currentId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id')
        .lt('id', currentId)
        .order('id', { ascending: false })
        .limit(1)
      
      if (error) throw error
      return data && data.length > 0 ? data[0].id : null
    } catch (err) {
      console.error('Error fetching previous post:', err)
      return null
    }
  }, [])
  
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*, profiles(*)')
          .eq('id', params?.id)
          .single()
        
        if (error) throw error
        setPost(data)
        
        if (data?.store_id) {
          const { data: storeData, error: storeError } = await supabase
            .from('stores')
            .select('*')
            .eq('id', data.store_id)
            .single()
          
          if (storeError) throw storeError
          setStore(storeData)
        }
        
        const currentId = params?.id as string
        if (currentId) {
          const [nextId, prevId] = await Promise.all([
            fetchNextPostId(currentId),
            fetchPreviousPostId(currentId)
          ])
          setNextPostId(nextId)
          setPrevPostId(prevId)
        }
      } catch (err: any) {
        console.error('Error fetching post:', err)
        setError(err.message || 'Failed to load post')
      } finally {
        setLoading(false)
      }
    }
    
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*, profiles(*)')
          .eq('post_id', params?.id)
        
        if (error) throw error
        setComments(data || [])
      } catch (err) {
        console.error('Error fetching comments:', err)
      }
    }
    
    fetchPost()
    fetchComments()
  }, [params?.id, fetchNextPostId, fetchPreviousPostId])
  
  // Memoize navigation function
  const navigateToPost = useCallback((postId: string | null) => {
    if (postId && !loading) {
      setLoading(true)
      router.push(`/posts/${postId}`)
    }
  }, [loading, router])

  // Render loading state
  if (loading && !post) return <PostSkeleton />
  
  // Render error state
  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error loading post</h3>
          <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100 rounded-md hover:bg-red-200 dark:hover:bg-red-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }
  
  // Render no post state
  if (!post) return <div className="max-w-3xl mx-auto py-8 px-4">Post not found</div>

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 relative">
      {/* Navigation buttons */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigateToPost(prevPostId)}
          disabled={!prevPostId || loading}
          className={`flex items-center px-4 py-2 rounded-full transition-all ${
            prevPostId
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-800/40'
              : 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
          }`}
          aria-label="Previous post"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Previous Post
        </button>
        
        <button
          onClick={() => navigateToPost(nextPostId)}
          disabled={!nextPostId || loading}
          className={`flex items-center px-4 py-2 rounded-full transition-all ${
            nextPostId
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-800/40'
              : 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
          }`}
          aria-label="Next post"
        >
          Next Post
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <PostCard post={post} />
      {store && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Store: {store.name}
          </h3>
          {store.website && (
            <a
              href={store.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Visit Website
            </a>
          )}
        </div>
      )}
      
      {post.description && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Description</h3>
          <div className="p-4 rounded-lg shadow-sm">
            <div
              className="rich-content prose prose-sm md:prose-base dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: post.description
                  .replace(/<img(.+?)>/g, '<div class="my-4 overflow-hidden rounded-lg"><img$1 class="w-full h-auto object-cover" /></div>')
                  .replace(/<iframe(.+?)><\/iframe>/g, '<div class="my-4 aspect-video overflow-hidden rounded-lg"><iframe$1 class="w-full h-full" allowfullscreen></iframe></div>')
                  .replace(/<video(.+?)><\/video>/g, '<div class="my-4 overflow-hidden rounded-lg"><video$1 class="w-full h-auto" controls></video></div>')
              }}
            />
          </div>
        </div>
      )}
      
      {/* Bottom navigation buttons */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => navigateToPost(prevPostId)}
          disabled={!prevPostId || loading}
          className={`flex items-center px-4 py-2 rounded-full transition-all ${
            prevPostId
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-800/40'
              : 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Previous Post
        </button>
        
        <button
          onClick={() => navigateToPost(nextPostId)}
          disabled={!nextPostId || loading}
          className={`flex items-center px-4 py-2 rounded-full transition-all ${
            nextPostId
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-800/40'
              : 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
          }`}
        >
          Next Post
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}
