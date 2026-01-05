import React from 'react';
import {
  User,
  Shield,
  Mail,
  Calendar,
  Edit2,
  Check,
  X,
  Phone,
} from 'lucide-react';
import { LoadingDots } from '@/components/atoms/loading-dots';
import { Dropdown } from '@/components/molecules/dropdown';
import { Input } from '@/components/atoms/input';
import { Button } from '@/components/atoms/button';

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

interface UserTableProps {
  users: UserData[];
  roles: Role[];
  isLoading: boolean;
  editingUserId: string | null;
  editValues: { name: string; phone: string; roleId: string } | null;
  isSaving: boolean;
  onStartEdit: (user: UserData) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditValueChange: (values: {
    name: string;
    phone: string;
    roleId: string;
  }) => void;
}

export const UserTable = ({
  users,
  roles,
  isLoading,
  editingUserId,
  editValues,
  isSaving,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditValueChange,
}: UserTableProps) => {
  if (isLoading) {
    return (
      <div className='bg-brand-card rounded-3xl border border-white/5 p-20 flex justify-center'>
        <LoadingDots className='h-12' />
      </div>
    );
  }

  return (
    <div className='bg-brand-card rounded-3xl border border-white/5 overflow-hidden flex flex-col min-h-[600px]'>
      <div className='overflow-x-auto flex-1'>
        <table className='w-full border-collapse min-w-[1000px]'>
          <thead>
            <tr className='border-b border-white/5 text-gray-500 text-[10px] uppercase tracking-[0.2em]'>
              <th className='px-8 py-5 font-black text-left'>
                User Information
              </th>
              <th className='px-8 py-5 font-black text-left'>
                Contact Details
              </th>
              <th className='px-8 py-5 font-black text-center'>Role</th>
              <th className='px-8 py-5 font-black text-center'>Registration</th>
              <th className='px-8 py-5 font-black text-right'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-white/5'>
            {users.map((u, index) => {
              const isEditing = editingUserId === u.id;
              const isLastRows = index >= users.length - 2 && users.length > 3;

              return (
                <tr
                  key={u.id}
                  className='hover:bg-white/[0.02] transition-colors group'
                >
                  <td className='px-8 py-8'>
                    <div className='flex items-center gap-4'>
                      <div className='w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent border border-brand-accent/20'>
                        <User size={24} />
                      </div>
                      <div className='flex flex-col gap-1'>
                        {isEditing ? (
                          <Input
                            value={editValues?.name}
                            onChange={(e) =>
                              onEditValueChange({
                                ...editValues!,
                                name: e.target.value,
                              })
                            }
                            className='h-9 text-sm min-w-[180px]'
                            placeholder='Full Name'
                          />
                        ) : (
                          <p className='font-bold text-white text-base group-hover:text-brand-accent transition-colors'>
                            {u.name}
                          </p>
                        )}
                        <p className='text-[10px] font-black text-gray-500 uppercase tracking-widest'>
                          ID: {u.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='px-8 py-8'>
                    <div className='flex flex-col gap-2'>
                      <div className='flex items-center gap-2.5 text-sm text-gray-400 font-medium'>
                        <div className='w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center'>
                          <Mail size={12} className='text-gray-500' />
                        </div>
                        {u.email}
                      </div>
                      <div className='flex items-center gap-2.5 text-sm text-gray-400 font-medium'>
                        <div className='w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center'>
                          <Phone size={12} className='text-gray-500' />
                        </div>
                        {isEditing ? (
                          <Input
                            value={editValues?.phone}
                            onChange={(e) =>
                              onEditValueChange({
                                ...editValues!,
                                phone: e.target.value,
                              })
                            }
                            className='h-9 text-sm min-w-[180px]'
                            placeholder='Phone Number'
                          />
                        ) : (
                          <span
                            className={
                              u.phone ? 'text-gray-400' : 'text-gray-600 italic'
                            }
                          >
                            {u.phone || 'No phone provided'}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className='px-8 py-8 text-center'>
                    <div className='flex justify-center'>
                      {isEditing ? (
                        <Dropdown
                          value={editValues?.roleId || ''}
                          onChange={(val) =>
                            onEditValueChange({ ...editValues!, roleId: val })
                          }
                          options={roles.map((r) => ({
                            value: r.id,
                            label: r.name,
                          }))}
                          className='min-w-[140px]'
                          position={isLastRows ? 'top' : 'bottom'}
                        />
                      ) : (
                        <div className='flex items-center gap-2'>
                          <Shield size={14} className='text-brand-accent' />
                          <span className='text-[10px] font-black uppercase tracking-widest text-brand-accent bg-brand-accent/10 px-2.5 py-1 rounded-lg border border-brand-accent/20'>
                            {u.role?.name || 'No Role'}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className='px-8 py-8 text-center'>
                    <div className='flex items-center justify-center gap-2.5 text-sm text-gray-500 font-bold'>
                      <Calendar size={14} className='text-gray-600' />
                      {new Date(u.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </td>
                  <td className='px-8 py-8 text-right'>
                    {isEditing ? (
                      <div className='flex items-center justify-end gap-2'>
                        <Button
                          onClick={onSaveEdit}
                          disabled={isSaving}
                          variant='ghost'
                          className='w-10 h-10 p-0 bg-brand-income/10 text-brand-income hover:bg-brand-income/20 border-brand-income/20'
                        >
                          {isSaving ? (
                            <LoadingDots className='w-8' />
                          ) : (
                            <Check size={18} />
                          )}
                        </Button>
                        <Button
                          onClick={onCancelEdit}
                          variant='ghost'
                          className='w-10 h-10 p-0 bg-brand-expense/10 text-brand-expense hover:bg-brand-expense/20 border-brand-expense/20'
                        >
                          <X size={18} />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => onStartEdit(u)}
                        variant='ghost'
                        className='w-10 h-10 p-0 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border-white/10 transition-all'
                      >
                        <Edit2 size={18} />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Spacer to prevent dropdown clipping */}
      <div className='px-8 py-10 border-t border-white/5 bg-white/[0.01] rounded-b-3xl flex justify-center items-center'>
        <p className='text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] opacity-20'>
          User Management System
        </p>
      </div>
    </div>
  );
};
