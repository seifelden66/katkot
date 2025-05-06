import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-toastify'
const isClient = typeof window !== 'undefined';

import { Post } from '@/types/post';



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
      
      const post = data;
      post.author = post.profiles;
      
      return post;
    },
    enabled: !!id && isClient,
  });
}

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
      return data;
    },
    enabled: !!storeId && isClient,
  });
}

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

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: isClient,
  });
}

export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: isClient,
  });
}

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*, regions(*)')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId && isClient,
  });
}

export function usePosts(options: {
  categoryId: number | null;
  storeId: number | null;
  regionId: number | null;
  userId?: string | null;
}) {
  const { categoryId, storeId, regionId, userId } = options;
  
  return useQuery({
    queryKey: ['posts', categoryId, storeId, regionId],
    queryFn: async () => {
      let userRegionPosts: Post[] = [];
      let otherRegionPosts: Post[] = [];
      
      let base = supabase.from('posts').select(
        `*,author:profiles!user_id(full_name,avatar_url),category:categories!posts_category_id_fkey(name),region:regions!posts_region_id_fkey(name,code)`
      );
      
      if (categoryId) base = base.eq('category_id', categoryId);
      if (storeId) base = base.eq('store_id', storeId);
      
      if (userId && regionId) {
        const { data: r } = await base
          .or(`region_id.eq.${regionId},region_id.eq.1`)
          .order('created_at', { ascending: false });
        
        if (r) userRegionPosts = r;
        
        const { data: o } = await base
          .not('region_id', 'in', `(${regionId},1)`)
          .order('created_at', { ascending: false });
        
        if (o) otherRegionPosts = o;
        
        return [...userRegionPosts, ...otherRegionPosts];
      }
      
      const { data } = await base.order('created_at', { ascending: false });
      return data || [];
    },
    enabled: isClient,
  });
}


export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regions')
        .select('id, name')
        .order('name', { ascending: true })
      
      if (error) throw error
      return data || []
    }
  })
}

export function usePostComments(postIds: (string | number)[]) {
  return useQuery({
    queryKey: ['allComments', postIds.join(',')],
    queryFn: async () => {
      if (!postIds.length) return {};
      
      const { data } = await supabase
        .from('comments')
        .select(`*,author:profiles!user_id(full_name,avatar_url)`)
        .in('post_id', postIds)
        .order('created_at', { ascending: true });
      
      return data?.reduce((acc, comment) => {
        acc[comment.post_id] = (acc[comment.post_id] || []).concat(comment);
        return acc;
      }, {} as Record<number, Comment[]>);
    },
    enabled: postIds.length > 0 && isClient,
  });
}

export function useNextPostId(postId: string | string[] | undefined) {
  return useQuery({
    queryKey: ['nextPost', postId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('id')
          .gt('id', postId)
          .order('id', { ascending: true })
          .limit(1)

        if (error) throw error
        return data && data.length > 0 ? data[0].id : null
      } catch (error) {
        console.error('Error fetching next post:', error)
        return null
      }
    },
    enabled: !!postId && isClient,
  });
}

export function usePrevPostId(postId: string | string[] | undefined) {
  return useQuery({
    queryKey: ['prevPost', postId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('id')
          .lt('id', postId)
          .order('id', { ascending: false })
          .limit(1)

        if (error) throw error
        return data && data.length > 0 ? data[0].id : null
      } catch (error) {
        console.error('Error fetching previous post:', error)
        return null
      }
    },
    enabled: !!postId && isClient,
  });
}


export function useUserPosts(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-posts', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!user_id (full_name, avatar_url),
          category:categories!posts_category_id_fkey (name),
          store_name,
          description
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) {
        toast.error('Failed to load posts')
        throw error
      }
      return data || []
    },
    enabled: !!userId && isClient,
  });
}

export function useFollowerCount(userId: string | undefined) {
  return useQuery({
    queryKey: ['follower-count', userId],
    queryFn: async () => {
      if (!userId) return 0
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId)
      if (error) throw error
      return count || 0
    },
    enabled: !!userId && isClient,
  });
}

export function useFollowingCount(userId: string | undefined) {
  return useQuery({
    queryKey: ['following-count', userId],
    queryFn: async () => {
      if (!userId) return 0
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId)
      if (error) throw error
      return count || 0
    },
    enabled: !!userId && isClient,
  });
}

export function useIsFollowing(userId: string | undefined, currentUserId: string | undefined) {
  return useQuery({
    queryKey: ['isFollowing', userId, currentUserId],
    queryFn: async () => {
      if (!currentUserId || !userId) return false

      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', currentUserId)
        .eq('following_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return false 
        }
        throw error
      }
      return !!data
    },
    enabled: !!currentUserId && !!userId && currentUserId !== userId && isClient,
  });
}


export function useUsersToFollow(currentUserId: string | undefined) {
  return useQuery({
    queryKey: ['users-to-follow'],
    queryFn: async () => {
      if (!currentUserId) return []

      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId)

      const followingIds = followingData?.map(f => f.following_id) || []
      
      // If there are no following IDs, we need to handle that case
      const notInClause = followingIds.length > 0 
        ? `(${[currentUserId, ...followingIds].join(',')})` 
        : `(${currentUserId})`

      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', notInClause)
        .limit(3)

      return users || []
    },
    enabled: !!currentUserId && isClient,
  });
}

export function useExistingFollow(followerId: string | undefined, followingId: string | undefined) {
  return useQuery({
    queryKey: ['existingFollow', followerId, followingId],
    queryFn: async () => {
      if (!followerId || !followingId) return null;
      
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      
      return data;
    },
    enabled: !!followerId && !!followingId && followerId !== followingId && isClient,
  });
}


export function usePostReactions(postId: string | undefined) {
  return useQuery({
    queryKey: ['reactions', postId],
    queryFn: async () => {
      if (!postId) return [];
      
      const { data, error } = await supabase
        .from('reactions')
        .select('type, user_id')
        .eq('post_id', postId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!postId && isClient,
  });
}

export function useToggleReaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      postId, 
      userId, 
      type,
      previousReaction 
    }: { 
      postId: string; 
      userId: string; 
      type: 'like' | 'dislike';
      previousReaction: string | null;
    }) => {
      if (previousReaction) {
        await supabase
          .from('reactions')
          .delete()
          .match({
            post_id: postId,
            user_id: userId
          });
      }
      
      if (previousReaction !== type) {
        const { error } = await supabase
          .from('reactions')
          .insert({
            post_id: postId,
            type,
            user_id: userId
          });
          
        if (error) throw error;
        return type;
      }
      
      return null;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reactions', variables.postId] });
    }
  });
}

// in your hooks file...

export function useFollowersList(userId: string | undefined) {
  return useQuery({
    queryKey: ["followers-list", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data: follows, error: followsError } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", userId);

      if (followsError) throw followsError;

      const ids = follows.map((f) => f.follower_id);
      if (ids.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", ids);

      if (profilesError) throw profilesError;
      return profiles;
    },
    enabled: Boolean(userId) && isClient,
  });
}


export function useFollowingList(userId: string | undefined) {
  return useQuery({
    queryKey: ["following-list", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data: follows, error: followsError } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);

      if (followsError) throw followsError;

      const ids = follows.map((f) => f.following_id);
      if (ids.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", ids);

      if (profilesError) throw profilesError;
      return profiles;
    },
    enabled: Boolean(userId) && isClient,
  });
}
