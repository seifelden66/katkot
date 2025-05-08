'use client'
import { useLocale } from 'next-intl';
import { useEffect } from 'react'
import { useSession } from '@/contexts/SessionContext'
import { useRouter } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { usePostReactions, useToggleReaction } from '@/app/hooks/queries/usePostQueries'
import { supabase } from '@/lib/supabaseClient'

export default function ReactionButtons({ postId }: { postId: string }) {
  const session = useSession()
  const userId = session.session?.user?.id || null
  const router = useRouter()
  const locale = useLocale();
  
  const { data: reactions = [] } = usePostReactions(postId);
  const toggleReaction = useToggleReaction();
  
  const likes = reactions.filter(r => r.type === 'like').length;
  const dislikes = reactions.filter(r => r.type === 'dislike').length;
  const userReaction = userId ? reactions.find(r => r.user_id === userId)?.type || null : null;
  
  useEffect(() => {
    const channel = supabase
      .channel('realtime-reactions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reactions',
        filter: `post_id=eq.${postId}`
      }, () => {
        router.refresh();
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId, router]);

  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!userId) {
      showLoginNotification()
      return
    }

    try {
      toggleReaction.mutate({
        postId,
        userId,
        type,
        previousReaction: userReaction
      });
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
        className: "bg-white text-gray-800",
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