import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { userAtom, isSessionLoadingAtom } from '@/lib/auth/atoms';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/molecules/page-header';
import { UserTable } from '@/components/organisms/user-table';
import { ListTemplate } from '@/components/templates/list-template';

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
  const user = useAtomValue(userAtom);
  const isSessionLoading = useAtomValue(isSessionLoadingAtom);
  const queryClient = useQueryClient();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ name: string; phone: string; roleId: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: users = [], isLoading: isUsersLoading } = useQuery<UserData[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }
      return res.json();
    },
    enabled: !!user && !isSessionLoading,
    staleTime: 1000 * 60 * 5,
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
    enabled: !!user && !isSessionLoading
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
    
    const originalUser = users.find(u => u.id === editingUserId);
    const hasChanged = 
      editValues.name !== originalUser?.name || 
      editValues.phone !== (originalUser?.phone || '') || 
      editValues.roleId !== originalUser?.role?.id;

    if (!hasChanged) {
      setEditingUserId(null);
      setEditValues(null);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/users/${editingUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      });
      
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(`Error: ${data.message || 'Failed to update user'}`);
        setIsSaving(false);
      }
    } catch (error) {
      console.error('Error updating user', error);
      setIsSaving(false);
    }
  };

  return (
    <ListTemplate
      permission="users:view"
      header={
        <PageHeader 
          title="Accounts Management" 
          description="Manage user roles and permissions"
        />
      }
      content={
        <UserTable
          users={users}
          roles={roles}
          isLoading={isLoading}
          editingUserId={editingUserId}
          editValues={editValues}
          isSaving={isSaving}
          onStartEdit={handleStartEdit}
          onCancelEdit={() => { setEditingUserId(null); setEditValues(null); }}
          onSaveEdit={handleUpdateUser}
          onEditValueChange={setEditValues}
        />
      }
    />
  );
}
