import { useInfiniteQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';

// Check if we're on the client
const isClient = typeof window !== 'undefined';

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
}

export function useInfiniteData<T>({
  queryKey,
  endpoint,
  pageSize = 10,
  enabled = true
}: {
  queryKey: string[];
  endpoint: string;
  pageSize?: number;
  enabled?: boolean;
}) {
  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = null }) => {
      const url = pageParam 
        ? `${endpoint}?cursor=${pageParam}&limit=${pageSize}`
        : `${endpoint}?limit=${pageSize}`;
      
      return apiRequest<PaginatedResponse<T>>(url);
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: enabled && isClient,
  });
}

// Helper hooks for specific data types
export function useInfinitePosts({ category, userId }: { category?: string; userId?: string } = {}) {
  let endpoint = '/posts';
  if (category) endpoint += `/category/${category}`;
  if (userId) endpoint += `/user/${userId}`;
  
  return useInfiniteData({
    queryKey: ['posts', 'infinite', category, userId],
    endpoint,
  });
}

export function useInfiniteUsers() {
  return useInfiniteData({
    queryKey: ['users', 'infinite'],
    endpoint: '/users',
  });
}