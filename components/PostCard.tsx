'use client'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import ReactionButtons from './ReactionButtons'

export default function PostCard({ post, session }: { post: any, session: any }) {
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<any[]>([])
  
  // Add useEffect for initial load
  useEffect(() => {
    fetchComments()
  }, [post.id]) // Add this effect

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, user:profiles(full_name, avatar_url)')  // Changed username -> full_name
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    
    if (!error) setComments(data || [])
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !session?.user) return
    
    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: post.id,
        content: comment,
        user_id: session.user.id
      })
    
    if (!error) {
      setComment('')
      await fetchComments()  // Ensure fresh comments load
    }
  }

  return (
    <div className="p-4 border-b">
      {/* Add post content display */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          {post.author?.avatar_url && (
            <img 
              src={post.author.avatar_url} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full"
            />
          )}
          <div>
            <p className="font-medium">{post.author?.full_name}</p>
            <p className="text-sm text-gray-500">{post.category_name}</p>
          </div>
        </div>
        <p className="text-gray-800">{post.content}</p>
        {post.media_url && (
          <img
            src={post.media_url}
            alt="Post content"
            className="mt-2 rounded-lg max-w-full h-auto"
          />
        )}
      </div>

      {/* Existing reactions and comments code */}
      <ReactionButtons postId={post.id} userId={session?.user?.id} />
      
      {/* Comments section */}
      <div className="mt-4">
        <h4 className="font-medium mb-2">Comments ({comments.length})</h4>
        {comments.map(c => (
          <div key={c.id} className="ml-4 border-l-2 pl-2">
            <p className="text-sm">{c.user.full_name}: {c.content}</p> {/* Fixed username -> full_name */}
          </div>
        ))}
        
        {session && (
          <form onSubmit={handleComment} className="mt-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-2 border rounded"
            />
            <button type="submit" className="mt-1 text-sm text-blue-600">
              Post Comment
            </button>
          </form>
        )}
      </div>
    </div>
  )
}