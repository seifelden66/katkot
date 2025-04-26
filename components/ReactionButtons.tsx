'use client'
import { supabase } from '@/lib/supabaseClient'
import { useLocale } from 'next-intl';

import { useEffect, useState } from 'react'
import { useSession } from '@/contexts/SessionContext'
import { useRouter } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function ReactionButtons({ postId }: { postId: string }) {
  const [likes, setLikes] = useState(0)
  const [dislikes, setDislikes] = useState(0)
  const [userReaction, setUserReaction] = useState<string | null>(null)
  const session = useSession()
  const userId = session.session?.user?.id || null
  const router = useRouter()
  const locale = useLocale();

  useEffect(() => {
    const fetchReactions = async () => {
      const { data, error } = await supabase
        .from('reactions')
        .select('type, user_id')
        .eq('post_id', postId)

      if (error) {
        console.error('Reactions fetch error:', error)
        return
      }

      setLikes(data?.filter(r => r.type === 'like').length || 0)
      setDislikes(data?.filter(r => r.type === 'dislike').length || 0)

      if (userId) {
        const userReaction = data?.find(r => r.user_id === userId)?.type
        setUserReaction(userReaction || null)
      }
    }

    fetchReactions()

    const channel = supabase
      .channel('realtime-reactions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reactions',
        filter: `post_id=eq.${postId}`
      }, () => fetchReactions())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId, userId])

  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!userId) {
      showLoginNotification()
      return
    }

    try {
      const previousReaction = userReaction
      let newReaction: string | null = type

      if (previousReaction) {
        await supabase
          .from('reactions')
          .delete()
          .match({
            post_id: postId,
            user_id: userId
          })
      }

      if (previousReaction !== type) {
        const { error } = await supabase
          .from('reactions')
          .insert({
            post_id: postId,
            type,
            user_id: userId // User ID from session
          })

        if (!error) newReaction = type
      } else {
        newReaction = null
      }

      // Optimistic updates
      setUserReaction(newReaction)
      setLikes(prev => {
        if (type === 'like') return newReaction ? prev + 1 : prev - 1
        return previousReaction === 'like' ? prev - 1 : prev
      })
      setDislikes(prev => {
        if (type === 'dislike') return newReaction ? prev + 1 : prev - 1
        return previousReaction === 'dislike' ? prev - 1 : prev
      })

    } catch (error) {
      console.error('Reaction error:', error)
    }
  }

  const showLoginNotification = () => {
    toast(
      <div className="flex flex-col">
        <p className="mb-2">You need to be logged in to react to posts</p>
        <button 
          onClick={() => router.push(locale+'/auth/login')}
          className="self-start bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium"
        >
          Sign in
        </button>
      </div>,
      {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "bg-white  text-gray-800 ",
      }
    );
  };

  return (
    <div className="relative flex gap-4 mt-2">
      <button
        onClick={() => handleReaction('like')}
        className={`flex cursor-pointer items-center gap-1 ${userReaction === 'like' ? 'text-blue-600' : 'text-gray-600'}`}
      >
        👍 {likes}
      </button>
      <button
        onClick={() => handleReaction('dislike')}
        className={`flex cursor-pointer items-center gap-1 ${userReaction === 'dislike' ? 'text-red-600' : 'text-gray-600'}`}
      >
        👎 {dislikes}
      </button>
      <ToastContainer />
    </div>
  )
}