'use client'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import PostCard from '@/components/PostCard'
import { useEffect, useState } from 'react'
import RichContent from '@/components/RichContent'

export default function PostPage() {
  const params = useParams()
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [store, setStore] = useState<any>(null)

  useEffect(() => {
    const fetchPost = async () => {
      // Get post with profile info
      const { data } = await supabase
        .from('posts')
        .select('*, profiles(*)')
        .eq('id', params?.id)
        .single()

      setPost(data)
      
      // If post has store_id, fetch store details
      if (data?.store_id) {
        const { data: storeData } = await supabase
          .from('stores')
          .select('*')
          .eq('id', data.store_id)
          .single()
        
        setStore(storeData)
      }
    }

    const fetchComments = async () => {
      const { data } = await supabase
        .from('comments')
        .select('*, profiles(*)')
        .eq('post_id', params?.id)

      setComments(data || [])
    }

    fetchPost()
    fetchComments()
  }, [params.id])

  if (!post) return <div>Loading...</div>

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
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
                __html: post.description.replace(
                  /<img(.+?)>/g, 
                  '<div class="my-4 overflow-hidden rounded-lg"><img$1 class="w-full h-auto object-cover" /></div>'
                ).replace(
                  /<iframe(.+?)><\/iframe>/g,
                  '<div class="my-4 aspect-video overflow-hidden rounded-lg"><iframe$1 class="w-full h-full" allowfullscreen></iframe></div>'
                ).replace(
                  /<video(.+?)><\/video>/g,
                  '<div class="my-4 overflow-hidden rounded-lg"><video$1 class="w-full h-auto" controls></video></div>'
                )
              }}
            />
          </div>
        </div>
      )}
      
      {/* <div className="mt-8 space-y-4">
        <h3 className="text-xl font-bold">Comments ({comments.length})</h3>
        {comments.map(comment => (
          <div key={comment?.id} className="border-l-4 pl-4 border-gray-200">
            <div className="flex items-center mb-2">
              <img
                src={comment.profiles.avatar_url || '/default-avatar.png'}
                className="w-8 h-8 rounded-full mr-2"
                alt={comment.profiles.full_name || 'User'}
              />
              <span className="font-medium">{comment.profiles.full_name}</span>
            </div>
            <p className="text-gray-800">{comment.content}</p>
          </div>
        ))}
      </div> */}
    </div>
  )
}