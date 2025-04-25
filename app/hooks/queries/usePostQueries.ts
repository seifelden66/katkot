import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

// Check if we're on the client
const isClient = typeof window !== 'undefined';

// ... existing interfaces ...

// Get a single post by ID
export function usePost(id: string | string[] | undefined) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Format the data to match the expected structure
      const post = data as PostWithAuthor;
      post.author = post.profiles;
      
      return post;
    },
    enabled: !!id && isClient,
  });
}

// Get store information
export function useStore(storeId: string | undefined) {
  return useQuery({
    queryKey: ['store', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single();
      
      if (error) throw error;
      return data as Store;
    },
    enabled: !!storeId && isClient,
  });
}

// Get comments for a post
export function useComments(postId: string | string[] | undefined) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, user:profiles(full_name, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Comment[];
    },
    enabled: !!postId && isClient,
  });
}

// Add a comment to a post
export function useAddComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      postId, 
      userId, 
      content 
    }: { 
      postId: string; 
      userId: string; 
      content: string 
    }) => {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content
        })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
    }
  });
}

// Get next post ID for navigation
export function useNextPostId(currentId: string | undefined) {
  return useQuery({
    queryKey: ['nextPost', currentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id')
        .gt('id', currentId as string)
        .order('id', { ascending: true })
        .limit(1);
      
      if (error) throw error;
      return data && data.length > 0 ? data[0].id : null;
    },
    enabled: !!currentId && isClient,
  });
}

// ... other query hooks with the same pattern ...