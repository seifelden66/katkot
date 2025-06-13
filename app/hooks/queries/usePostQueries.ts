import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-toastify';
import { createNotification } from '@/lib/notifications';
const isClient = typeof window !== 'undefined';

import { Post } from '@/types/post';

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    full_name: string;
    avatar_url: string;
  };
  author?: {
    full_name: string;
    avatar_url: string;
  };
}

interface CommentParams {
  postId: string;
  userId: string;
  content: string;
}

interface ReactionParams {
  postId: string;
  userId: string;
  type: 'like' | 'dislike';
  previousReaction: string | null;
}

interface PointsParams {
  userId: string;
  delta: number;
  type: string;
  metadata?: Record<string, string | number | boolean>;
}

interface CreatePostParams {
  userId: string;
  content: string;
  storeId: number;
  categoryId: number;
  regionId: number;
  isGroup: boolean;
  mediaUrl?: string;
  affiliateLink?: string;
}

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
    mutationFn: async ({ postId, userId, content }: CommentParams) => {
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
      queryClient.invalidateQueries({ queryKey: ['allComments'] });
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
    queryKey: ['userPosts', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          category:categories!posts_category_id_fkey(name),
          store:stores(name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId && isClient,
  });
}

export function useUserPoints(userId: string | undefined) {
  return useQuery({
    queryKey: ['userPoints', userId],
    queryFn: async () => {
      if (!userId) return 0;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('points_balance')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data?.points_balance || 0;
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

export function usePostReactionsBulk(postIds: (string | number)[]) {
  return useQuery({
    queryKey: ['allReactions', postIds.join(',')],
    queryFn: async () => {
      if (!postIds.length) return {};
      const { data, error } = await supabase
        .from('reactions')
        .select('post_id, type, user_id')
        .in('post_id', postIds);
      if (error) throw error;
      return (data || []).reduce((acc, reaction) => {
        acc[reaction.post_id] = (acc[reaction.post_id] || []).concat(reaction);
        return acc;
      }, {} as Record<string, { type: string; user_id: string }[]>);
    },
    enabled: postIds.length > 0 && isClient,
  });
}
export function useToggleReaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, userId, type, previousReaction }: ReactionParams) => {
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
        const { data: postData } = await supabase
          .from('posts')
          .select('user_id')
          .eq('id', postId)
          .single();
        
        const { error } = await supabase
          .from('reactions')
          .insert({
            post_id: postId,
            type,
            user_id: userId
          });
          
        if (error) throw error;
        
        if (postData && postData.user_id !== userId) {
          await createNotification({
            userId: postData.user_id,
            actorId: userId,
            type: 'like',
            postId
          });
        }
        
        return type;
      }
      
      return null;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reactions', variables.postId] });
    }
  });
}

export function useModifyPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, delta, type, metadata = {} }: PointsParams) => {
      const { error } = await supabase.rpc('modify_points', {
        uid: userId,
        pts_delta: delta,
        pts_type: type,
        meta: metadata,
      });
      if (error) throw error;
      return { delta, type };
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    }
  });
}


export function useCreatePost() {
  const queryClient = useQueryClient();
  const spendPoints = useModifyPoints();

  return useMutation({
    mutationFn: async ({
      userId,
      content,
      storeId,
      categoryId,
      regionId,
      isGroup,
      mediaUrl,
      affiliateLink
    }: CreatePostParams) => {
      const cost = isGroup ? 50 : 20;

      await spendPoints.mutateAsync({
        userId,
        delta: -cost,
        type: isGroup ? 'spend_group_post' : 'spend_post',
        metadata: { contentSnippet: content.slice(0, 20) }
      });

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          content,
          store_id: storeId,
          category_id: categoryId,
          region_id: regionId,
          media_url: mediaUrl,
          affiliate_link: affiliateLink,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post created!');
    },
    onError: (err: Error | { message: string }) => {
      toast.error(err.message);
    }
  });
}




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

export function useCurrentUserProfile() {
  
  return useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: isClient,
    staleTime: 1000 * 60 * 5, 
  });
}


interface Notification {
  id: number
  created_at: string
  type: string
  read: boolean
  post_id?: string
  actor: {
    id: string
    full_name: string
    avatar_url: string
  }
  posts?: {
    content: string
  }
}

export function useNotifications(userId: string | undefined) {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:actor_id(id, full_name, avatar_url),
          posts:post_id(content)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }
      
      return data as Notification[] || [];
    },
    enabled: !!userId && isClient,
  });
}

export function useMarkNotificationsAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationIds: number[]) => {
      if (notificationIds.length === 0) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', notificationIds);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: number) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

export function useDeleteAllNotifications() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

export function useUnreadNotificationsCount(userId: string | undefined) {
  return useQuery({
    queryKey: ['unreadNotificationsCount', userId],
    queryFn: async () => {
      if (!userId) return 0;
      
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);
        
      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId && isClient,
  });
}


export function useSearch(q: string) {
  return useQuery({
    queryKey: ['search', q],
    enabled: q.trim().length >= 2,
    queryFn: async () => {
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .ilike('full_name', `%${q}%`)
        .limit(5)

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
        .limit(10)

      if (usersError || postsError) {
        throw new Error(usersError?.message || postsError?.message)
      }

      return { users: users || [], posts: posts || [] }
    }
  })
}
