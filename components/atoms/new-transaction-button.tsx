import React from 'react';
import { Plus } from 'lucide-react';
import { PermissionGuard } from '@/components/atoms/permission-guard';

interface NewTransactionButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'ghost';
}

export function NewTransactionButton({ onClick, variant = 'primary' }: NewTransactionButtonProps) {
  if (variant === 'ghost') {
    return (
      <PermissionGuard permission="movements:create" fallback={null}>
        <button 
          onClick={onClick}
          className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/80 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-accent/20 border border-brand-accent/20"
        >
          <Plus size={16} />
          <span>New Movement</span>
        </button>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard permission="movements:create" fallback={null}>
      <button 
        onClick={onClick}
        className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/80 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-brand-accent/20"
      >
        <Plus size={20} />
        New Movement
      </button>
    </PermissionGuard>
  );
}
