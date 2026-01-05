import { useRouter } from 'next/router';
import { useAtomValue } from 'jotai';
import { userAtom, permissionsAtom, isAdminAtom, isSessionLoadingAtom } from '@/lib/auth/atoms';
import { LoadingDots } from '@/components/atoms/loading-dots';
import { ShieldAlert } from 'lucide-react';
import { useEffect } from 'react';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  fallback?: React.ReactNode;
}

export const PermissionGuard = ({ children, permission, fallback }: PermissionGuardProps) => {
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const permissions = useAtomValue(permissionsAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const isPending = useAtomValue(isSessionLoadingAtom);
  
  console.log('PermissionGuard State:', { 
    path: router.asPath, 
    isPending, 
    hasUser: !!user, 
    permission,
    isAdmin 
  });

  const hasPermission = isAdmin || (permission ? permissions.includes(permission) : true);

  useEffect(() => {
    if (!isPending && !user && router.isReady && router.pathname !== '/login') {
      router.replace('/login');
    }
  }, [isPending, user, router.isReady, router.pathname]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingDots color="#9333ea" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (permission && !hasPermission) {
    console.log('PermissionGuard: Access Denied', { permission, hasPermission });
    if (fallback !== undefined) return <>{fallback}</>;
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center w-full bg-black/20 backdrop-blur-[2px] border border-white/5 rounded-3xl text-center p-12 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-red-500/10 p-4 rounded-full mb-6">
          <ShieldAlert className="text-red-500" size={48} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-gray-400 max-w-md">
          You don't have the required permissions to access this section. 
          Please contact your administrator if you believe this is an error.
        </p>
        <button 
          onClick={() => router.push('/')}
          className="mt-8 px-8 py-3 bg-white text-black rounded-2xl font-bold hover:bg-gray-200 transition-all shadow-lg shadow-white/10"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  console.log('PermissionGuard: Rendering Children', { path: router.asPath });
  return <>{children}</>;
};
