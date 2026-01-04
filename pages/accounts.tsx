import { useState } from 'react';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useAuth } from '@/lib/auth/context';
import { User, Shield, Mail, Calendar, MoreVertical, Edit2 } from 'lucide-react';
import { LoadingDots } from '@/components/ui/loading-dots';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/page-header';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
}

export default function AccountsPage() {
  const { user, isLoading: isSessionLoading, isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  const { data: users = [], isLoading: isUsersLoading } = useQuery<UserData[]>({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json()),
    enabled: !!user && !isSessionLoading && !isAuthLoading
  });

  const { data: roles = [], isLoading: isRolesLoading } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: () => fetch('/api/roles').then(res => res.json()),
    enabled: !!user && !isSessionLoading && !isAuthLoading
  });

  const isLoading = isUsersLoading || isRolesLoading;

  const handleUpdateRole = async (userId: string, roleId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId }),
      });
      if (res.ok) {
        setEditingUser(null);
        queryClient.invalidateQueries({ queryKey: ['users'] });
      }
    } catch (error) {
      console.error('Error updating role', error);
    }
  };

  return (
    <PermissionGuard permission="users:view">
      <div className="flex flex-col gap-8">
        <PageHeader 
          title="Accounts Management" 
          description="Manage user roles and permissions"
        />

        <div className="bg-brand-card rounded-3xl border border-white/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-8 py-6 font-bold">User</th>
                <th className="px-8 py-6 font-bold">Role</th>
                <th className="px-8 py-6 font-bold">Joined</th>
                <th className="px-8 py-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12">
                    <LoadingDots className="h-12" />
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {editingUser?.id === user.id ? (
                        <select 
                          className="bg-brand-bg border border-white/10 rounded-lg px-2 py-1 text-sm focus:outline-none"
                          value={user.role?.id || ''}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          onBlur={() => setEditingUser(null)}
                          autoFocus
                        >
                          <option value="" disabled>Select role</option>
                          {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.role?.name === 'ADMIN' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {user.role?.name || 'No Role'}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <PermissionGuard permission="users:edit" fallback={null}>
                        <button 
                          onClick={() => setEditingUser(user)}
                          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-white"
                        >
                          <Edit2 size={18} />
                        </button>
                      </PermissionGuard>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PermissionGuard>
  );
}
