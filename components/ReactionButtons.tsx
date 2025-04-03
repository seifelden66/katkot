'use client'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

export default function ReactionButtons({ postId, userId }: { postId: string, userId?: string }) {
  const [likes, setLikes] = useState(0)
  const [dislikes, setDislikes] = useState(0)
  const [userReaction, setUserReaction] = useState<string | null>(null)

  useEffect(() => {
    const fetchReactions = async () => {
      const { data } = await supabase
        .from('reactions')
        .select('type, user_id')
        .eq('post_id', postId)
      
      // Set counts
      setLikes(data?.filter(r => r.type === 'like').length || 0)
      setDislikes(data?.filter(r => r.type === 'dislike').length || 0)
      
      // Set user's current reaction
      if (userId) {
        const userReaction = data?.find(r => r.user_id === userId)?.type
        setUserReaction(userReaction || null)
      }
    }
    
    fetchReactions()

    // Real-time updates
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
    if (!userId) return
    
    try {
      const previousReaction = userReaction
      let newReaction: string | null = type
      
      // Toggle off if clicking same reaction
      if (previousReaction === type) {
        await supabase
          .from('reactions')
          .delete()
          .match({ post_id: postId, user_id: userId })
        newReaction = null
      } 
      // Replace with new reaction if different
      else {
        await supabase
          .from('reactions')
          .upsert(
            { post_id: postId, user_id: userId, type },
            { onConflict: 'post_id,user_id' }
          )
      }
      
      // Optimistic updates
      setUserReaction(newReaction)
      setLikes(prev => {
        if (type === 'like') {
          return newReaction ? prev + 1 : prev - 1
        }
        return previousReaction === 'like' ? prev - 1 : prev
      })
      setDislikes(prev => {
        if (type === 'dislike') {
          return newReaction ? prev + 1 : prev - 1
        }
        return previousReaction === 'dislike' ? prev - 1 : prev
      })
      
    } catch (error) {
      console.error('Reaction error:', error)
    }
  }

  return (
    <div className="flex gap-4 mt-2">
      <button 
        onClick={() => handleReaction('like')}
        className={`flex items-center gap-1 ${userReaction === 'like' ? 'text-blue-600' : 'text-gray-600'}`}
        disabled={!userId}
      >
        👍 {likes}
      </button>
      <button
        onClick={() => handleReaction('dislike')}
        className={`flex items-center gap-1 ${userReaction === 'dislike' ? 'text-red-600' : 'text-gray-600'}`}
        disabled={!userId}
      >
        👎 {dislikes}
      </button>
    </div>
  )
}