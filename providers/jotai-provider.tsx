import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { userAtom, roleAtom, permissionsAtom, isSessionLoadingAtom } from '@/lib/auth/atoms';
import { authClient } from '@/lib/auth/client';
import { useQuery } from '@tanstack/react-query';

export const JotaiInitializer = ({ children }: { children: React.ReactNode }) => {
  const setUser = useSetAtom(userAtom);
  const setRole = useSetAtom(roleAtom);
  const setPermissions = useSetAtom(permissionsAtom);
  const setIsSessionLoading = useSetAtom(isSessionLoadingAtom);

  // We fetch auth details directly. If it returns 401, we know there's no session.
  // This avoids the waterfall of waiting for authClient.useSession() first.
  const { data: authDetails, isLoading: isAuthDetailsLoading, isError, error } = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      if (res.status === 401) return null; // Not logged in
      if (!res.ok) throw new Error('Failed to fetch auth details');
      return res.json();
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    console.log('JotaiInitializer Update:', { 
      isAuthDetailsLoading, 
      hasAuthDetails: !!authDetails,
      isError 
    });

    if (isAuthDetailsLoading) {
      setIsSessionLoading(true);
      return;
    }

    if (authDetails) {
      console.log('JotaiInitializer: Setting Auth Details', { role: authDetails.role });
      setUser(authDetails.user);
      setRole(authDetails.role);
      setPermissions(authDetails.permissions);
      setIsSessionLoading(false);
    } else {
      // Either 401 (null) or Error
      console.log('JotaiInitializer: No Session or Error', error);
      setUser(null);
      setRole(null);
      setPermissions([]);
      setIsSessionLoading(false);
    }
  }, [authDetails, isAuthDetailsLoading, isError, error, setUser, setRole, setPermissions, setIsSessionLoading]);

  return <>{children}</>;
};
