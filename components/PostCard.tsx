'use client'
import { supabase } from '@/lib/supabaseClient'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ReactionButtons from './ReactionButtons'
import { useSession } from '@/contexts/SessionContext'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns';

// Shimmer effect component for loading state
export const ShimmerEffect = () => (
  <div className="animate-pulse rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-4 mb-4">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      </div>
    </div>
    
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    </div>
    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
    <div className="flex gap-4 mb-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
    </div>
    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="flex-1">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  </div>
);

const CommentItem = ({ comment }: { comment: any }) => (
  <div className="flex items-start gap-3 p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
    {comment.user?.avatar_url ? (
      <Image
        src={comment.user.avatar_url}
        alt={`${comment.user.full_name}'s avatar`}
        width={36}
        height={36}
        className="w-9 h-9 rounded-full object-cover"
      />
    ) : (
      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
        {comment.user?.full_name?.charAt(0) || '?'}
      </div>
    )}
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="font-medium ">{comment.user?.full_name}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
        </span>
      </div>
      <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{comment.content}</p>
    </div>
  </div>
);

export default function PostCard({ post }: { post: any }) {
  const { session } = useSession()  
  const userId = session?.user?.id
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCommenting, setIsCommenting] = useState(false)
  const [showAllComments, setShowAllComments] = useState(false)
  const [commentsExpanded, setCommentsExpanded] = useState(false)
  
  useEffect(() => {
    fetchComments()
  }, [post?.id]) 

  const fetchComments = async () => {
    if (!post?.id) return
    
    setIsLoading(true)
    const { data, error } = await supabase
      .from('comments')
      .select('*, user:profiles(full_name, avatar_url)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    
    if (!error) setComments(data || [])
    setIsLoading(false)
  }

  const handleComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !userId) return
    
    setIsCommenting(true)
    
    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: post.id,
        content: comment,
        user_id: userId
      })
    
    if (!error) {
      setComment('')
      await fetchComments()
    }
    
    setIsCommenting(false)
  }, [comment, post?.id, userId]);
  
  const displayedComments = useMemo(() => {
    const commentsToShow = showAllComments ? comments : comments.slice(0, 2)
    return commentsToShow.map(c => (
      <CommentItem key={c.id} comment={c} />
    ))
  }, [comments, showAllComments]);

  if (isLoading) {
    return <ShimmerEffect />
  }

  const formattedDate = post?.created_at 
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
    : '';

  return (
    <div className="rounded-xl shadow-sm overflow-hidden mb-4">
      <div className="p-4">
        {/* Post Header */}
        <div className="flex items-center gap-3 mb-3">
          <Link href={`/profile/${post.user_id}`}>
            {post.author?.avatar_url ? (
              <Image 
                src={post.author.avatar_url}
                alt={`${post.author.full_name}'s avatar`}
                width={44}
                height={44}
                className="w-11 h-11 rounded-full object-cover"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold">
                {post.author?.full_name?.charAt(0) || '?'}
              </div>
            )}
          </Link>
          <div>
            <Link href={`/profile/${post.user_id}`} className="font-medium  hover:underline">
              {post.author?.full_name}
            </Link>
            <div className="flex items-center gap-2 text-sm ">
              <span>{formattedDate}</span>
              {post.category && (
                <>
                  <span>•</span>
                  <Link href={`/category/${post.category_id}`} className="transition-colors">
                    {post.category?.name}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Post Content */}
        <div className="mb-4">
          <p className="whitespace-pre-line">{post.content}</p>
          
          {post.store_name && (
            <div className="mt-2 flex items-center text-sm text-blue-600 dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>{post.store_name}</span>
            </div>
          )}
          
          {post.media_url && (
            <div className="mt-3 rounded-lg overflow-hidden">
              <Link href={`/posts/${post.id}`}>
              <Image
                src={post.media_url}
                width={800}
                height={600}
                alt="Post media content"
                className="w-full h-auto object-cover max-h-[500px]"
              />
              </Link>
            </div>
          )}
        </div>

        {/* Reactions */}
        <ReactionButtons postId={post.id} />
        
        {/* Comments Section */}
        <div className="mt-4 pt-3 ">
          <button 
            onClick={() => setCommentsExpanded(!commentsExpanded)}
            className="flex cursor-pointer items-center justify-between w-full mb-3"
          >
            <h4 className="font-medium ">
              Comments ({comments.length})
            </h4>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform ${commentsExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Comments List */}
          {commentsExpanded && (
            <>
              <div className="space-y-1">
                {displayedComments}
              </div>
              
              {comments.length > 2 && (
                <button 
                  onClick={() => setShowAllComments(!showAllComments)}
                  className="text-sm text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 mt-2"
                >
                  {showAllComments ? 'Show less' : `Show all ${comments.length} comments`}
                </button>
              )}
              
              {/* Comment Form */}
              {session ? (
                <form onSubmit={handleComment} className="mt-3 pt-2">
                  <div className="flex gap-3">
                    {session.user?.user_metadata?.avatar_url ? (
                      <Image
                        src={session.user.user_metadata.avatar_url}
                        alt="Your avatar"
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                        {session.user?.user_metadata?.full_name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full p-3 bg-gray-100 dark:bg-gray-700 border-none rounded-full  placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex justify-end mt-2">
                        <button 
                          type="submit" 
                          disabled={isCommenting || !comment.trim()}
                          className={`px-4 py-2 rounded-full text-sm font-medium ${
                            isCommenting || !comment.trim()
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
                          } transition-colors`}
                        >
                          {isCommenting ? 'Posting...' : 'Post Comment'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    <Link href="/auth/login" className="text-purple-500 dark:text-purple-400 hover:underline">Sign in</Link> to leave a comment
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}