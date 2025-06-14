// src/app/hooks/queries/searchQueries.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';

export interface SearchUser {
  id: string;
  full_name: string;
  avatar_url: string;
}

export interface SearchPost {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

export function useSearch(q: string) {
  return useQuery({
    queryKey: ['search', q],
    queryFn: async () => {
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .ilike('full_name', `%${q}%`)
        .limit(5);

      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          user_id,
          author:profiles!user_id(id, full_name, avatar_url)
        `)
        .ilike('content', `%${q}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (usersError || postsError) {
        throw new Error(usersError?.message || postsError?.message);
      }

      return {
        users: users as SearchUser[],
        posts: (posts as Array<{
          id: string;
          content: string;
          created_at: string;
          user_id: string;
          author: Array<{
            id: string;
            full_name: string;
            avatar_url: string;
          }>;
        }>).map(post => ({
          ...post,
          author: post.author[0]    })) as SearchPost[],
      };
    },
    enabled: q.length >= 2
  });
}
