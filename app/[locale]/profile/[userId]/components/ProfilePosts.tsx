import Link from 'next/link'
import Image from 'next/image'

interface ProfilePostsProps {
  userPosts: {
    id: string
    content: string
    media_url?: string
    created_at: string
    category?: {
      name: string
    }
  }[]
  locale: string
}

export default function ProfilePosts({ userPosts, locale }: ProfilePostsProps) {
  if (userPosts.length === 0) {
    return (
      <div className="rounded-xl shadow-sm p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <h3 className="text-lg font-medium mb-2">No posts yet</h3>
        <p className="text-gray-500">This user has not created any posts yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {userPosts.map(post => (
        <Link key={post.id} href={`/${locale}/posts/${post.id}`}>
          <div className="rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {post.media_url && (
              <div className="h-48 overflow-hidden">
                {/* {post.media_url.includes('bing.com') ? (
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
                    unoptimized={post.media_url.startsWith('data:') || post.media_url.includes('blob:') ? true : undefined}
                  />
                )} */}
                  <Image
                    src={post.media_url}
                    width={800}
                    height={600}
                    alt="Post media content"
                    className="w-full h-auto object-cover max-h-[500px]"
                    unoptimized={post.media_url.startsWith('data:') || post.media_url.includes('blob:') ? true : undefined}
                  />
              </div>
            )}
            <div className="p-4">
              <p className="text-gray-500 text-sm mb-2">
                {new Date(post.created_at).toLocaleDateString()}
                {post.category && (
                  <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs">
                    {post.category.name}
                  </span>
                )}
              </p>
              <p className="text-gray-800 line-clamp-3">{post.content}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}