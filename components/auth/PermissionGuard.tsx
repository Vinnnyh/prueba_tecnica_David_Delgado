import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth/context';
import { LoadingDots } from '@/components/ui/loading-dots';

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

  if (permission && !permissions.includes(permission)) {
    if (fallback !== undefined) return <>{fallback}</>;
    
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-red-500/10 border border-red-500/20 rounded-3xl text-center">
        <h2 className="text-xl font-bold text-red-500 mb-2">Access Denied</h2>
        <p className="text-gray-400">You don't have the required permission: <code className="bg-black/20 px-2 py-1 rounded">{permission}</code></p>
        <button 
          onClick={() => router.push('/')}
          className="mt-6 px-6 py-2 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
