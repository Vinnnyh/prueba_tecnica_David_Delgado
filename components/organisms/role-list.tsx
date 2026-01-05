import { useState } from 'react';
import { Edit2, Trash2, Shield, ChevronRight } from 'lucide-react';
import { Role, Permission } from '@/lib/hooks/use-roles';
import { cn } from '@/lib/utils';

interface RoleListProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  canEdit?: boolean;
}

export const RoleList = ({ roles, onEdit, onDelete, isDeleting, canEdit = true }: RoleListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roles.map((role) => (
        <div 
          key={role.id}
          className="bg-brand-card border border-white/10 rounded-2xl p-6 hover:border-brand-accent/30 transition-all group flex flex-col"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="bg-brand-accent/10 p-3 rounded-xl">
              <Shield className="text-brand-accent" size={24} />
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(role)}
                className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                title={canEdit ? "Edit Role" : "View Role"}
              >
                <Edit2 size={18} />
              </button>
              {canEdit && (
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
                      onDelete(role.id);
                    }
                  }}
                  disabled={isDeleting || role.name === 'ADMIN'}
                  className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Delete Role"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-1">{role.name}</h3>
          <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">
            {role.description || 'No description provided.'}
          </p>

          <div className="space-y-3 mb-8 flex-1">
            <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span>Permissions</span>
              <span>{role.permissions.length} total</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {role.permissions.slice(0, 4).map((perm) => (
                <span 
                  key={perm.id}
                  className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold text-gray-300"
                >
                  {perm.name}
                </span>
              ))}
              {role.permissions.length > 4 && (
                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold text-gray-500">
                  +{role.permissions.length - 4} more
                </span>
              )}
              {role.permissions.length === 0 && (
                <span className="text-xs text-gray-600 italic">No permissions assigned</span>
              )}
            </div>
          </div>

          <button
            onClick={() => onEdit(role)}
            className="w-full mt-auto flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all"
          >
            {canEdit ? 'Manage Permissions' : 'View Permissions'}
            <ChevronRight size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
