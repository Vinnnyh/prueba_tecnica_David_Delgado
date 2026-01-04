import React, { createContext, useContext, ReactNode } from 'react';
import { authClient } from './client';
import { useQuery } from '@tanstack/react-query';

interface AuthContextType {
  user: any;
  role: string | null;
  permissions: string[];
  isLoading: boolean;
  isAuthLoading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const { 
    data: authDetails, 
    isLoading: isAuthLoading,
    refetch: refresh
  } = useQuery({
    queryKey: ['auth-me', session?.user.id],
    queryFn: async () => {
      if (!session) return null;
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error('Failed to fetch auth details');
      return res.json();
    },
    enabled: !!session,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return (
    <AuthContext.Provider value={{ 
      user: session?.user, 
      role: authDetails?.role || null, 
      permissions: authDetails?.permissions || [], 
      isLoading: isSessionPending,
      isAuthLoading: isAuthLoading && !!session,
      refresh: async () => { await refresh(); }
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
