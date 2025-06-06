import { useToggleReaction } from '@/app/hooks/queries/usePostQueries';
import { useSession } from '@/contexts/SessionContext'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ReactionButtonsProps {
  postId: string;
  reactions?: { type: string; user_id: string }[];
}

export default function ReactionButtons({ postId, reactions: initialReactions = [] }: ReactionButtonsProps) {
  const { session } = useSession();
  const userId = session?.user?.id;
  const [reactions, setReactions] = useState(initialReactions);
  
  const { mutate: toggleReaction } = useToggleReaction();
  
  useEffect(() => {
    setReactions(initialReactions);
  }, [initialReactions]);
  
  useEffect(() => {
    const channel = supabase
      .channel(`reactions:${postId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reactions',
        filter: `post_id=eq.${postId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setReactions(prev => [...prev.filter(r => r.user_id !== payload.new.user_id), { type: payload.new.type, user_id: payload.new.user_id }]);
        } else if (payload.eventType === 'DELETE') {
          setReactions(prev => prev.filter(r => !(r.user_id === payload.old.user_id)));
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);
  
  const likesCount = reactions.filter(r => r.type === 'like').length;
  const dislikesCount = reactions.filter(r => r.type === 'dislike').length;
  const userReaction = reactions.find(r => r.user_id === userId)?.type || null;
  
  const handleReaction = (type: 'like' | 'dislike') => {
    if (!userId) return;
    
    const optimisticReactions = [...reactions];
    const existingReactionIndex = optimisticReactions.findIndex(r => r.user_id === userId);
    
    if (existingReactionIndex >= 0) {
      optimisticReactions.splice(existingReactionIndex, 1);
      
      if (optimisticReactions[existingReactionIndex]?.type !== type) {
        optimisticReactions.push({ user_id: userId, type });
      }
    } else {
      optimisticReactions.push({ user_id: userId, type });
    }
    
    setReactions(optimisticReactions);

    toggleReaction({
      postId,
      userId,
      type,
      previousReaction: userReaction
    });
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => handleReaction('like')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
          userReaction === 'like'
            ? 'bg-green-100 text-green-600'
            : 'bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]'
        }`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
        </svg>
        <span>{likesCount}</span>
      </button>
      
      <button
        onClick={() => handleReaction('dislike')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
          userReaction === 'dislike'
            ? 'bg-red-100 text-red-600'
            : 'bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]'
        }`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
        </svg>
        <span>{dislikesCount}</span>
      </button>
    </div>
  );
}
