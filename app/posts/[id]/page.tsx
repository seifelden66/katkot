'use client'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import PostCard from '@/components/PostCard'

export default function PostPage() {
  const params = useParams()
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*, profiles(*)')
        .eq('id', params?.id)
        .single()

      setPost(data)
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
      <div className="mt-8 space-y-4">
        <h3 className="text-xl font-bold">Comments ({comments.length})</h3>
        {comments.map(comment => (
          <div key={comment?.id} className="border-l-4 pl-4 border-gray-200">
            <div className="flex items-center mb-2">
              <img 
                src={comment.profiles.avatar_url || '/default-avatar.png'}
                className="w-8 h-8 rounded-full mr-2"
              />
              <span className="font-medium">{comment.profiles.full_name}</span>
            </div>
            <p className="text-gray-800">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}