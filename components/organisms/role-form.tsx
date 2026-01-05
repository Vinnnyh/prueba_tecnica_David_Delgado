import { useState } from 'react';
import { X, Shield, Check, Info } from 'lucide-react';
import { Role, Permission } from '@/lib/hooks/use-roles';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { cn } from '@/lib/utils';

interface RoleFormProps {
  role?: Role | null;
  allPermissions: Permission[];
  onSave: (data: {
    name: string;
    description: string;
    permissionIds: string[];
  }) => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
  canEdit?: boolean;
}

export const RoleForm = ({
  role,
  allPermissions,
  onSave,
  onClose,
  isSaving,
  canEdit = true,
}: RoleFormProps) => {
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    role?.permissions.map((p) => p.id) || []
  );

  const togglePermission = (id: string) => {
    if (!canEdit) return;

    const permission = allPermissions.find((p) => p.id === id);
    if (!permission) return;

    setSelectedPermissions((prev) => {
      const isSelecting = !prev.includes(id);
      let next = isSelecting ? [...prev, id] : prev.filter((p) => p !== id);

      if (isSelecting) {
        // Dependency logic: if selecting an "action" permission, auto-select the "view" permission
        const dependencies: Record<string, string> = {
          'roles:edit': 'roles:view',
          'movements:create': 'movements:view',
          'movements:export': 'movements:view',
          'users:edit': 'users:view',
        };

        const basePermissionName = dependencies[permission.name];
        if (basePermissionName) {
          const basePermission = allPermissions.find(
            (p) => p.name === basePermissionName
          );
          if (basePermission && !next.includes(basePermission.id)) {
            next.push(basePermission.id);
          }
        }
      } else {
        // Reverse dependency logic: if de-selecting a "view" permission, auto-deselect the "action" permissions
        const reverseDependencies: Record<string, string[]> = {
          'roles:view': ['roles:edit'],
          'movements:view': ['movements:create', 'movements:export'],
          'users:view': ['users:edit'],
        };

        const dependentPermissionNames = reverseDependencies[permission.name];
        if (dependentPermissionNames) {
          const dependentIds = allPermissions
            .filter((p) => dependentPermissionNames.includes(p.name))
            .map((p) => p.id);
          next = next.filter((p) => !dependentIds.includes(p));
        }
      }

      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !canEdit) return;
    await onSave({ name, description, permissionIds: selectedPermissions });
  };

  return (
    <div className='fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6'>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300'
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className='relative w-full max-w-2xl bg-brand-card border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col'>
        <div className='flex items-center justify-between p-6 border-b border-white/10 shrink-0'>
          <div className='flex items-center gap-3'>
            <div className='bg-brand-accent/10 p-2 rounded-lg'>
              <Shield className='text-brand-accent' size={20} />
            </div>
            <h2 className='text-xl font-bold text-white'>
              {role ? `Edit Role: ${role.name}` : 'Create New Role'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        {!canEdit && (
          <div className='px-6 py-3 bg-red-500/10 border-b border-red-500/20 flex items-center gap-3'>
            <Info size={16} className='text-red-500' />
            <p className='text-xs font-bold text-red-500 uppercase tracking-wider'>
              You don&apos;t have permission to edit roles.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className='flex flex-col flex-1 overflow-hidden'
        >
          <div className='flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar'>
            <div className='grid grid-cols-1 gap-6'>
              <div className='space-y-2'>
                <label className='text-xs font-bold text-gray-500 uppercase tracking-wider'>
                  Role Name
                </label>
                <Input
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                  placeholder='e.g. MANAGER'
                  required
                  disabled={role?.name === 'ADMIN' || !canEdit}
                />
              </div>

              <div className='space-y-2'>
                <label className='text-xs font-bold text-gray-500 uppercase tracking-wider'>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setDescription(e.target.value)
                  }
                  placeholder='What can this role do?'
                  disabled={!canEdit}
                  className='w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-brand-accent/50 transition-all min-h-[80px] resize-none disabled:opacity-50 disabled:cursor-not-allowed'
                />
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <label className='text-xs font-bold text-gray-500 uppercase tracking-wider'>
                  Permissions
                </label>
                <span className='text-[10px] font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-full'>
                  {selectedPermissions.length} Selected
                </span>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {allPermissions.map((perm) => {
                  const isSelected = selectedPermissions.includes(perm.id);
                  return (
                    <button
                      key={perm.id}
                      type='button'
                      onClick={() => togglePermission(perm.id)}
                      disabled={!canEdit}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-xl border transition-all text-left group',
                        isSelected
                          ? 'bg-brand-accent/10 border-brand-accent/50'
                          : 'bg-white/5 border-white/10 hover:border-white/20',
                        !canEdit && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div
                        className={cn(
                          'mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all',
                          isSelected
                            ? 'bg-brand-accent border-brand-accent'
                            : 'bg-transparent border-white/20 group-hover:border-white/40'
                        )}
                      >
                        {isSelected && (
                          <Check size={12} className='text-white' />
                        )}
                      </div>
                      <div>
                        <p
                          className={cn(
                            'text-sm font-bold transition-colors',
                            isSelected
                              ? 'text-white'
                              : 'text-gray-400 group-hover:text-gray-300'
                          )}
                        >
                          {perm.name}
                        </p>
                        <p className='text-[10px] text-gray-500 mt-0.5'>
                          {perm.description || 'No description'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className='p-6 border-t border-white/10 bg-brand-card/50 backdrop-blur-md flex gap-3 shrink-0'>
            <Button variant='outline' onClick={onClose} className='flex-1 py-4'>
              {canEdit ? 'Cancel' : 'Close'}
            </Button>
            {canEdit && (
              <Button
                type='submit'
                disabled={!name}
                isLoading={isSaving}
                className='flex-[2] py-4'
              >
                {role ? 'Save Changes' : 'Create Role'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
