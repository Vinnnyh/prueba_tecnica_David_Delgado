import React from 'react';
import { LoadingDots } from '@/components/atoms/loading-dots';
import { cn } from '@/lib/utils';

interface RoleSwitcherProps {
  role: string | null;
  isAdmin: boolean;
  isSwitching: boolean;
  onSwitch: () => void;
}

export const RoleSwitcher = ({ role, isAdmin, isSwitching, onSwitch }: RoleSwitcherProps) => {
  return (
    <div className="mt-auto p-4 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden group">
      {isSwitching && (
        <div className="absolute inset-0 bg-brand-sidebar/80 backdrop-blur-[2px] z-10 flex items-center justify-center">
          <LoadingDots color="#9333ea" />
        </div>
      )}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Demo Role</span>
        <div className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${isAdmin ? 'bg-brand-accent/20 text-brand-accent' : 'bg-gray-500/20 text-gray-400'}`}>
          {role}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-gray-300">Admin Mode</span>
        <div 
          onClick={onSwitch}
          className={cn(
            "w-10 h-5 rounded-full p-1 transition-colors duration-200",
            isSwitching ? "cursor-not-allowed" : "cursor-pointer",
            isAdmin ? "bg-brand-accent" : "bg-gray-600"
          )}
        >
          <div className={cn(
            "w-3 h-3 bg-white rounded-full transition-transform duration-200",
            isAdmin ? "translate-x-5" : "translate-x-0"
          )} />
        </div>
      </div>
    </div>
  );
};
