'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession } from './SessionContext';
import { useUserPoints } from '@/app/hooks/queries/usePostQueries';

interface PointsContextType {
  points: number;
  isLoading: boolean;
  refreshPoints: () => void;
}

const PointsContext = createContext<PointsContextType>({
  points: 0,
  isLoading: true,
  refreshPoints: () => {},
});

export const usePoints = () => useContext(PointsContext);

export function PointsProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const userId = session?.user?.id;

  const { data, isLoading, refetch } = useUserPoints(userId);

  const refreshPoints = () => {
    refetch();
  };

  return (
    <PointsContext.Provider value={{ 
      points: data || 0, 
      isLoading: isLoading, 
      refreshPoints 
    }}>
      {children}
    </PointsContext.Provider>
  );
}