'use client'
import { useParams, useRouter } from 'next/navigation'
import PostCard from '@/components/PostCard'
import { useCallback, useEffect } from 'react'
import { useLocale } from 'next-intl'

// interface Store {
//   id: string;
//   name: string;
//   description?: string;
//   website?: string;
//   created_at?: string;
//   updated_at?: string;
// }

const PostSkeleton = () => (
  <div className="max-w-3xl mx-auto py-8 px-4 animate-pulse">
    <div className="h-10 bg-gray-200 rounded-md mb-6"></div>
    <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
    <div className="h-32 bg-gray-200 rounded-lg"></div>
  </div>
)



import { usePost,  useStore, useNextPostId, usePrevPostId } from '@/app/hooks/queries/usePostQueries';

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params?.id as string
  const locale = useLocale()

  const {
    data: post,
    isLoading: isPostLoading,
    error: postError
  } = usePost(postId);

  const {
    data: store,
    error: storeError
  } = useStore(post?.store_id);

  // const {
  //   data: comments = [],
  //   error: commentsError
  // } = useComments(postId);

  const {
    data: nextPostId,
    error: nextPostError
  } = useNextPostId(postId);

  const {
    data: prevPostId,
    error: prevPostError
  } = usePrevPostId(postId);


  useEffect(() => {
    if (!postId) {
      console.error('No post ID found in URL parameters')
    }
  }, [postId])

  useEffect(() => {
    if (storeError) console.error('Store error:', storeError)
    if (nextPostError) console.error('Next post error:', nextPostError)
    if (prevPostError) console.error('Previous post error:', prevPostError)
  }, [storeError, nextPostError, prevPostError])

  const navigateToPost = useCallback((postId: string | null) => {
    if (postId && !isPostLoading) {
      router.push(`/${locale}/posts/${postId}`)
    }
  }, [router, locale, isPostLoading])

  if (isPostLoading) return <PostSkeleton />

  if (postError) {
    const errorMessage = (postError as Error).message || 'Failed to load post'
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 text-center">
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-red-800">Error loading post</h3>
          <p className="mt-2 text-red-700">{errorMessage}</p>
          <button
            onClick={() => router.push(`/${locale}`)}
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  if (!post) return <div className="max-w-3xl mx-auto py-8 px-4">Post not found</div>

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 relative">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigateToPost(prevPostId)}
          disabled={!prevPostId || isPostLoading}
          className={`flex items-center px-4 py-2 rounded-full transition-all ${prevPostId
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              : 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
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
          disabled={!nextPostId || isPostLoading}
          className={`flex items-center px-4 py-2 rounded-full transition-all ${nextPostId
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              : 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
            }`}
          aria-label="Next post"
        >
          Next Post
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <PostCard post={{...post, category_id: post.category_id?.toString()}}  />

      {store && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
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
              className="rich-content prose prose-sm md:prose-base max-w-none"
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

      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => navigateToPost(prevPostId)}
          disabled={!prevPostId || isPostLoading}
          className={`flex items-center px-4 py-2 rounded-full transition-all ${prevPostId
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              : 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Previous Post
        </button>

        <button
          onClick={() => navigateToPost(nextPostId)}
          disabled={!nextPostId || isPostLoading}
          className={`flex items-center px-4 py-2 rounded-full transition-all ${nextPostId
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              : 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
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
