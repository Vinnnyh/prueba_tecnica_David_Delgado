import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authClient } from './client';

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
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const fetchAuthDetails = async (force = false) => {
    // Try to get from localStorage first if not forcing refresh
    if (!force) {
      const cached = localStorage.getItem(`auth_${session?.user.id}`);
      if (cached) {
        try {
          const { role: cachedRole, permissions: cachedPermissions } = JSON.parse(cached);
          if (role !== cachedRole || JSON.stringify(permissions) !== JSON.stringify(cachedPermissions)) {
            setRole(cachedRole);
            setPermissions(cachedPermissions);
          }
          setIsAuthLoading(false);
          return;
        } catch (e) {
          console.error('Error parsing cached auth', e);
        }
      }
    }

    if (force || !role) {
      setIsAuthLoading(true);
    }

    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (role !== data.role || JSON.stringify(permissions) !== JSON.stringify(data.permissions)) {
          setRole(data.role);
          setPermissions(data.permissions || []);
          
          localStorage.setItem(`auth_${session?.user.id}`, JSON.stringify({
            role: data.role,
            permissions: data.permissions
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching auth details:', error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    if (!isSessionPending) {
      if (session) {
        fetchAuthDetails();
      } else {
        setRole(null);
        setPermissions([]);
        setIsAuthLoading(false);
      }
    }
  }, [session, isSessionPending]);

  const refresh = async () => {
    await fetchAuthDetails(true);
  };

  return (
    <AuthContext.Provider value={{ 
      user: session?.user, 
      role, 
      permissions, 
      isLoading: isSessionPending,
      isAuthLoading,
      refresh 
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
