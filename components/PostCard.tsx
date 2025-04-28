'use client'
import { useCallback } from 'react'
import ReactionButtons from './ReactionButtons'
import { useSession } from '@/contexts/SessionContext'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'

interface Profile {
  avatar_url?: string;
  full_name?: string;
}

interface Comment {
  id: number; 
  post_id?: number;
  user_id?: string;
  content: string;
  created_at: string;
  author?: {
    full_name: string;
    avatar_url: string | null;
  };
  profiles?: {
    avatar_url?: string;
    full_name?: string;
  };
}

interface Category {
  name: string;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  category_id?: string;
  store_name?: string;
  media_url?: string;
  author?: Profile;
  category?: Category;
}

interface PostCardProps {
  post: Post;
  comments?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
}

interface AddCommentParams {
  postId: string;
  userId: string;
  content: string;
}

export const ShimmerEffect = () => (
  <div className="animate-pulse rounded-xl shadow-sm border border-gray-200  overflow-hidden p-4 mb-4">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-full bg-gray-200 "></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200  rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-gray-200  rounded w-1/3"></div>
      </div>
    </div>
    
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-gray-200  rounded w-full"></div>
      <div className="h-4 bg-gray-200  rounded w-5/6"></div>
      <div className="h-4 bg-gray-200  rounded w-3/4"></div>
    </div>
    <div className="h-48 bg-gray-200  rounded-lg mb-4"></div>
    <div className="flex gap-4 mb-4">
      <div className="h-8 bg-gray-200  rounded w-1/4"></div>
      <div className="h-8 bg-gray-200  rounded w-1/4"></div>
    </div>
    <div className="h-5 bg-gray-200  rounded w-1/3 mb-3"></div>
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 "></div>
        <div className="flex-1">
          <div className="h-3 bg-gray-200  rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200  rounded w-5/6"></div>
        </div>
      </div>
    </div>
  </div>
);

const CommentItem = ({ comment }: CommentItemProps) => (
  console.log(comment),
  
  <div className="flex items-start gap-3 p-3 border-b border-gray-100  hover:bg-gray-50 transition-colors">
    {comment.profiles?.avatar_url ? (
      <img
        src={comment.profiles.avatar_url}
        alt={`${comment.profiles.full_name}'s avatar`}
        width={36}
        height={36}
        className="w-9 h-9 rounded-full object-cover"
      />
    ) : (
      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
        {comment.profiles?.full_name?.charAt(0) || '?'}
      </div>
    )}
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="font-medium ">{comment.profiles?.full_name}</span>
        <span className="text-xs text-gray-500 ">
          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
        </span>
      </div>
      <p className="text-sm text-gray-800  mt-1">{comment.content}</p>
    </div>
  </div>
);

export default function PostCard({ post, comments = [] }: PostCardProps) {
  const { session } = useSession()  
  const locale = useLocale();
  const userId = session?.user?.id
  const queryClient = useQueryClient()
  
  const { mutate: addComment, isPending: isCommenting } = useMutation({
    mutationFn: async ({ postId, userId, content }: AddCommentParams) => {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content
        })
        .select('*, profiles(*)')        
      if (error) throw error
      return data[0]  
     },
    onSuccess: (newComment, variables) => {
      queryClient.setQueryData(['comments', variables.postId], (oldComments: Comment[] = []) => {
        return [...oldComments, newComment]
      })

      queryClient.setQueryData(['comments'], (oldData: Record<string, Comment[]> = {}) => {
        const updatedComments = { ...oldData }
        if (!updatedComments[variables.postId]) {
          updatedComments[variables.postId] = []
        }
        updatedComments[variables.postId] = [...updatedComments[variables.postId], newComment]
        return updatedComments
      })
    }
  })
  
  const handleComment = useCallback((e: React.FormEvent, content: string) => {
    e.preventDefault()
    if (!content.trim() || !userId || !post?.id) return
    
    addComment({
      postId: post.id,
      userId,
      content
    })
  }, [post?.id, userId, addComment])

  const formattedDate = post?.created_at 
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
    : '';

  return (
    <div className="rounded-xl shadow-sm overflow-hidden mb-4">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Link href={`/${locale}/profile/${post.user_id}`}>
            {post.author?.avatar_url ? (
              <img 
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
            <Link href={`${locale}/profile/${post.user_id}`} className="font-medium hover:underline">
              {post.author?.full_name}
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <span>{formattedDate}</span>
              {post.category && (
                <>
                  <span>•</span>
                  <Link href={`${locale}/category/${post.category_id}`} className="transition-colors">
                    {post.category?.name}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="whitespace-pre-line">{post.content}</p>
          
          {post.store_name && (
            <div className="mt-2 flex items-center text-sm text-blue-600 ">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>{post.store_name}</span>
            </div>
          )}
          
          {post.media_url && (
            <div className="mt-3 rounded-lg overflow-hidden">
              <Link href={`/${locale}/posts/${post.id}`}>
                {post.media_url.includes('bing.com') ? (
                  <img 
                    src={post.media_url} 
                    alt="Post media content"
                    className="w-full h-auto object-cover max-h-[500px]"
                  />
                ) : (
                  <Image
                    src={post.media_url}
                    width={800}
                    height={600}
                    alt="Post media content"
                    className="w-full h-auto object-cover max-h-[500px]"
                    unoptimized={post.media_url.startsWith('data:') || post.media_url.includes('blob:')}
                  />
                )}
              </Link>
            </div>
          )}
        </div>

        <ReactionButtons postId={post.id} />
        
        <div className="mt-4 pt-3">
          <h4 className="font-medium mb-3">
            Comments ({comments.length})
          </h4>
          
          <div className="space-y-1">
            {comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
          
          {session ? (
            <form 
              onSubmit={(e) => {
                const form = e.target as HTMLFormElement;
                const commentInput = form.elements.namedItem('comment') as HTMLInputElement;
                handleComment(e, commentInput.value);
                commentInput.value = '';
              }} 
              className="mt-3 pt-2"
            >
              <div className="flex gap-3">
                {session.user?.user_metadata?.avatar_url ? (
                  <img
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
                <div className="flex-1 relative">
                  <input
                    type="text"
                    name="comment"
                    placeholder="Add a comment..."
                    className="w-full py-2 px-4 bg-gray-100  rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 "
                  />
                  <button
                    type="submit"
                    disabled={isCommenting}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="mt-3 pt-2 text-center">
              <Link
                href={`/${locale}/auth/login`}
                className="text-purple-500 hover:text-purple-600  font-medium"
              >
                Sign in to comment
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}