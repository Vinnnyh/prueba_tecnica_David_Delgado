import { useState, useEffect } from 'react';
import { X, Shield, Check, Info } from 'lucide-react';
import { Role, Permission } from '@/lib/hooks/use-roles';
import { cn } from '@/lib/utils';
import { LoadingDots } from '@/components/ui/loading-dots';

interface RoleFormProps {
  role?: Role | null;
  allPermissions: Permission[];
  onSave: (data: { name: string; description: string; permissionIds: string[] }) => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
}

export const RoleForm = ({ role, allPermissions, onSave, onClose, isSaving }: RoleFormProps) => {
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    role?.permissions.map((p) => p.id) || []
  );

  const togglePermission = (id: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await onSave({ name, description, permissionIds: selectedPermissions });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-brand-card border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-brand-accent/10 p-2 rounded-lg">
              <Shield className="text-brand-accent" size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">
              {role ? `Edit Role: ${role.name}` : 'Create New Role'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. MANAGER"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-brand-accent/50 transition-all"
                  required
                  disabled={role?.name === 'ADMIN'}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What can this role do?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-brand-accent/50 transition-all min-h-[80px] resize-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Permissions</label>
                <span className="text-[10px] font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-full">
                  {selectedPermissions.length} Selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allPermissions.map((perm) => {
                  const isSelected = selectedPermissions.includes(perm.id);
                  return (
                    <button
                      key={perm.id}
                      type="button"
                      onClick={() => togglePermission(perm.id)}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-xl border transition-all text-left group",
                        isSelected 
                          ? "bg-brand-accent/10 border-brand-accent/50" 
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      )}
                    >
                      <div className={cn(
                        "mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                        isSelected 
                          ? "bg-brand-accent border-brand-accent" 
                          : "bg-transparent border-white/20 group-hover:border-white/40"
                      )}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                      <div>
                        <p className={cn(
                          "text-sm font-bold transition-colors",
                          isSelected ? "text-white" : "text-gray-400 group-hover:text-gray-300"
                        )}>
                          {perm.name}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {perm.description || 'No description'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-white/10 bg-brand-card/50 backdrop-blur-md flex gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name}
              className="flex-[2] py-4 bg-brand-accent hover:bg-brand-accent-hover rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/20"
            >
              {isSaving ? <LoadingDots color="white" /> : (role ? 'Update Role' : 'Create Role')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
