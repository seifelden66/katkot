'use client'
import { useCallback } from 'react'
import ReactionButtons from './molecules/ReactionButtons'
import { useSession } from '@/contexts/SessionContext'
import Image from 'next/image'
import { useLocale, useTranslations,  } from 'next-intl'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useAddComment } from '@/app/hooks/queries/usePostQueries';
import { CommentIcon } from './atoms/Icons'
import { useState } from 'react';

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

interface Reaction {
  type: string;
  user_id: string;
}

interface PostCardProps {
  post: Post;
  comments?: Comment[];
}

interface PostCardProps {
  post: Post;
  comments?: Comment[];
  reactions?: Reaction[];
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

const CommentItem = ({ comment, onClick }: { comment: Comment; onClick?: () => void }) => {
  const locale = useLocale();
  return (
  <div className="flex items-start gap-3 p-3 border-b border-gray-100" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
    <Link href={`/${locale}/profile/${comment.user_id}`}>
      {comment.author?.avatar_url ? (
        <Image
          src={comment.author.avatar_url}
          alt={`${comment.author.full_name}'s avatar`}
          width={36}
          height={36}
          className="w-9 h-9 rounded-full object-cover"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
          {comment.author?.full_name?.charAt(0) || '?'}
        </div>
      )}
    </Link>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <Link href={`/profile/${comment.user_id}`} className="font-medium">
          {comment.author?.full_name}
        </Link>
        <span className="text-xs text-gray-500 ">
          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
        </span>
      </div>
      <p className="text-sm text-gray-800 mt-1">{comment.content}</p>
    </div>
  </div>
)};

export default function PostCard({ post, comments = [], reactions = [] }: PostCardProps) {
  const { session } = useSession()  
  const locale = useLocale();
  const t = useTranslations('postCard');
  const userId = session?.user?.id
  
  const { mutate: addComment, isPending: isCommenting } = useAddComment();
  
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

  const [showAllComments, setShowAllComments] = useState(false);
  const displayedComments = showAllComments ? comments : comments.slice(0, 2);
  return (
    <div className="rounded-xl shadow-sm overflow-hidden mb-4">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Link href={`/${locale}/profile/${post.user_id}`}>
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
            <div className="mt-2 flex items-center text-sm text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>{post.store_name}</span>
            </div>
          )}
          
          {post.media_url && (
            <div className="mt-3 rounded-lg overflow-hidden cursor-pointer">
              <Link href={`/${locale}/posts/${post.id}`}>
                <Image
                  src={post.media_url}
                  width={800}
                  height={600}
                  alt="Post media content"
                  className="w-full h-auto object-cover max-h-[500px]"
                  unoptimized={post.media_url.startsWith('data:') || post.media_url.includes('blob:')}
                />
              </Link>
            </div>
          )}
        </div>

        <ReactionButtons postId={post.id} reactions={reactions} />
        
        <div className="mt-4 pt-3">
          <h4 className="font-medium mb-3">
            {t('comments')} ({comments.length})
          </h4>
          <div className="space-y-1">
            {displayedComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onClick={!showAllComments ? () => setShowAllComments(true) : undefined}
              />
            ))}
          </div>
          {comments.length > 2 && !showAllComments && (
            <button
              className="mt-2 px-4 py-2 rounded-full bg-gray-200 text-gray-800 text-sm font-medium"
              onClick={() => setShowAllComments(true)}
            >
              See More
            </button>
          )}
          
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
                <div className="flex-1 relative">
                  <input
                    type="text"
                    name="comment"
                    placeholder={t('addComment')}
                    className="w-full py-2 px-4 border-none rounded-full bg-[hsl(var(--muted))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-all text-[hsl(var(--foreground))]" 
                  />
                  <button
                    type="submit"
                    disabled={isCommenting}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                   <CommentIcon />
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="mt-3 pt-2 text-center">
              <Link
                href={`/${locale}/auth/login`}
                className="text-purple-500 hover:text-purple-600 font-medium"
              >
                {t('signInToComment')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
