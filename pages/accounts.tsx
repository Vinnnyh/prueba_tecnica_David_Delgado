import { useState } from 'react';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useAuth } from '@/lib/auth/context';
import { User, Shield, Mail, Calendar, MoreVertical, Edit2, Check, X, Phone } from 'lucide-react';
import { LoadingDots } from '@/components/ui/loading-dots';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/page-header';
import { Dropdown } from '@/components/ui/dropdown';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
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
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ name: string; phone: string; roleId: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: users = [], isLoading: isUsersLoading, error: usersError } = useQuery<UserData[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch(`/api/users?t=${Date.now()}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }
      return res.json();
    },
    enabled: !!user && !isSessionLoading && !isAuthLoading,
    staleTime: 0,
  });

  const { data: roles = [], isLoading: isRolesLoading } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await fetch('/api/roles');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch roles');
      }
      return res.json();
    },
    enabled: !!user && !isSessionLoading && !isAuthLoading
  });

  const isLoading = isUsersLoading || isRolesLoading;

  const handleStartEdit = (user: UserData) => {
    setEditingUserId(user.id);
    setEditValues({
      name: user.name,
      phone: user.phone || '',
      roleId: user.role?.id || ''
    });
  };

  const handleUpdateUser = async () => {
    if (!editingUserId || !editValues) return;
    
    setIsSaving(true);
    try {
      const res = await fetch(`/api/users/${editingUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      });
      
      const data = await res.json();

      if (res.ok) {
        setEditingUserId(null);
        setEditValues(null);
        await queryClient.invalidateQueries({ queryKey: ['users'] });
      } else {
        alert(`Error: ${data.message || 'Failed to update user'}`);
      }
    } catch (error) {
      console.error('Error updating user', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (usersError) {
    return (
      <PermissionGuard permission="users:view">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Shield className="w-12 h-12 text-brand-expense opacity-50" />
          <p className="text-gray-400 font-medium">{(usersError as Error).message}</p>
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard permission="users:view">
      <div className="flex flex-col gap-8">
        <PageHeader 
          title="Accounts Management" 
          description="Manage user roles and permissions"
        />

        <div className="bg-brand-card rounded-3xl border border-white/5 min-h-[500px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-8 py-6 font-bold">User</th>
                <th className="px-8 py-6 font-bold">Phone</th>
                <th className="px-8 py-6 font-bold">Role</th>
                <th className="px-8 py-6 font-bold">Joined</th>
                <th className="px-8 py-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12">
                    <LoadingDots className="h-12" />
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6 align-middle">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold shrink-0">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          {editingUserId === user.id ? (
                            <input 
                              type="text"
                              value={editValues?.name}
                              onChange={(e) => setEditValues(prev => prev ? { ...prev, name: e.target.value } : null)}
                              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-brand-accent/50 w-full"
                              placeholder="Name"
                            />
                          ) : (
                            <p className="font-bold text-white">{user.name}</p>
                          )}
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 align-middle">
                      {editingUserId === user.id ? (
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-gray-500" />
                          <input 
                            type="text"
                            value={editValues?.phone}
                            onChange={(e) => setEditValues(prev => prev ? { ...prev, phone: e.target.value } : null)}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-brand-accent/50 w-32"
                            placeholder="Phone"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Phone size={14} className="opacity-50" />
                          <span>{user.phone || 'Not set'}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 align-middle">
                      {editingUserId === user.id ? (
                        <Dropdown
                          value={editValues?.roleId || ''}
                          options={roles.map(role => ({ value: role.id, label: role.name }))}
                          onChange={(roleId) => setEditValues(prev => prev ? { ...prev, roleId } : null)}
                          placeholder="Select role"
                          className="min-w-[160px]"
                        />
                      ) : (
                        <div className="flex items-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            user.role?.name === 'ADMIN' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'
                          }`}>
                            {user.role?.name || 'No Role'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-400 align-middle">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right align-middle">
                      <PermissionGuard permission="users:edit" fallback={null}>
                        {editingUserId === user.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={handleUpdateUser}
                              disabled={isSaving}
                              className="p-2 hover:bg-green-500/10 rounded-lg transition-colors text-green-500"
                              title="Save"
                            >
                              {isSaving ? <LoadingDots className="h-4 w-4" /> : <Check size={18} />}
                            </button>
                            <button 
                              onClick={() => { setEditingUserId(null); setEditValues(null); }}
                              className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
                              title="Cancel"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleStartEdit(user)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-white"
                          >
                            <Edit2 size={18} />
                          </button>
                        )}
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
