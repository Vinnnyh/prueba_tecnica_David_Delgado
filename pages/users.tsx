import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useState } from 'react';
import { Edit2, Search, Filter } from 'lucide-react';
import { LoadingDots } from '@/components/ui/loading-dots';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/page-header';

interface User {
  id: string;
  name: string;
  email: string;
  role: {
    name: string;
  };
}

export default function UsersPage() {
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json())
  });

  return (
    <PermissionGuard permission="users:view">
      <div className="flex flex-col gap-8">
        <PageHeader 
          title="User Management" 
          description="Manage application users and their roles"
        />

        {/* Filters & Search */}
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search users...." 
              className="bg-transparent border-none focus:ring-0 text-sm w-full pl-10"
            />
          </div>
          <div className="h-6 w-px bg-white/10" />
          <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <Filter size={18} />
            Filters
          </button>
        </div>

        {/* Table */}
        <div className="bg-brand-card rounded-3xl border border-white/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-8 py-6 font-bold">Name</th>
                <th className="px-8 py-6 font-bold">Email</th>
                <th className="px-8 py-6 font-bold">Role</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-bold">{u.name}</p>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-400">
                      {u.email}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role.name === 'ADMIN' ? 'bg-brand-accent/10 text-brand-accent' : 'bg-gray-500/10 text-gray-500'
                      }`}>
                        {u.role.name}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <PermissionGuard permission="users:edit" fallback={null}>
                        <button className="p-2 text-gray-500 hover:text-white transition-colors">
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
