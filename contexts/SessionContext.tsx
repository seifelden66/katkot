'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface SessionContextType {
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => void;
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  isLoading: true,
  signOut: async () => {},
  refreshSession: () => {},
});

export const useSession = () => useContext(SessionContext);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Use TanStack Query to fetch and manage session
  const { data: session, refetch } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
    initialData: null,
  });

  // Set up auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        queryClient.setQueryData(['session'], session);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.setQueryData(['session'], null);
  };

  // Function to manually refresh session
  const refreshSession = () => {
    refetch();
  };

  return (
    <SessionContext.Provider value={{ session, isLoading, signOut, refreshSession }}>
      {children}
    </SessionContext.Provider>
  );
}