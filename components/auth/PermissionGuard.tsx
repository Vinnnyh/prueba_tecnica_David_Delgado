import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth/context';
import { LoadingDots } from '@/components/ui/loading-dots';
import { ShieldAlert } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  fallback?: React.ReactNode;
}

export const PermissionGuard = ({ children, permission, fallback }: PermissionGuardProps) => {
  const router = useRouter();
  const { user, permissions, isLoading, isAuthLoading } = useAuth();

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingDots className="h-12" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const { role } = useAuth();

  // ADMIN role has all permissions by default
  if (role === 'ADMIN') {
    return <>{children}</>;
  }

  if (permission && !permissions.includes(permission)) {
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

  return <>{children}</>;
};
