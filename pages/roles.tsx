import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { permissionsAtom, isAdminAtom } from '@/lib/auth/atoms';
import { PageHeader } from '@/components/molecules/page-header';
import { RoleList } from '@/components/organisms/role-list';
import { RoleForm } from '@/components/organisms/role-form';
import { useRoles, Role } from '@/lib/hooks/use-roles';
import { PermissionGuard } from '@/components/atoms/permission-guard';
import { Plus, ShieldAlert } from 'lucide-react';
import { LoadingDots } from '@/components/atoms/loading-dots';

export default function RolesPage() {
  const permissions = useAtomValue(permissionsAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const canEditRoles = isAdmin || permissions.includes('roles:edit');

  const { 
    roles, 
    permissions: allPermissions, 
    isLoading, 
    createRole, 
    updateRole, 
    deleteRole,
    isCreating,
    isUpdating,
    isDeleting
  } = useRoles();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingRole(null);
    setIsFormOpen(true);
  };

  const handleSave = async (data: { name: string; description: string; permissionIds: string[] }) => {
    try {
      if (editingRole) {
        await updateRole({ id: editingRole.id, ...data });
      } else {
        await createRole(data);
      }
      setIsFormOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <PermissionGuard permission="roles:view">
      <div className="space-y-8">
        <PageHeader 
          title="Roles & Permissions" 
          description="Manage user roles and their associated access levels across the platform."
        >
          {canEditRoles && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accent-hover text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-brand-accent/20"
            >
              <Plus size={18} />
              New Role
            </button>
          )}
        </PageHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <LoadingDots color="#9333ea" />
            <p className="text-gray-500 text-sm font-medium">Loading roles and permissions...</p>
          </div>
        ) : roles.length > 0 ? (
          <RoleList 
            roles={roles} 
            onEdit={handleEdit} 
            onDelete={deleteRole}
            isDeleting={isDeleting}
            canEdit={canEditRoles}
          />
        ) : (
          <div className="bg-brand-card border border-white/10 rounded-3xl p-12 flex flex-col items-center text-center">
            <div className="bg-white/5 p-4 rounded-2xl mb-4">
              <ShieldAlert className="text-gray-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No roles found</h3>
            <p className="text-gray-400 max-w-md mb-8">
              It seems there are no roles defined yet. Create your first role to start managing permissions.
            </p>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all"
            >
              <Plus size={18} />
              Create First Role
            </button>
          </div>
        )}

        {isFormOpen && (
          <RoleForm
            role={editingRole}
            allPermissions={allPermissions}
            onSave={handleSave}
            onClose={() => setIsFormOpen(false)}
            isSaving={isCreating || isUpdating}
            canEdit={canEditRoles}
          />
        )}
      </div>
    </PermissionGuard>
  );
}
