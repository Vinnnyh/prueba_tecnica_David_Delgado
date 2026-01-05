import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SidebarUserProps {
  user: {
    name: string;
    image?: string | null;
    phone?: string | null;
  };
  onClick: () => void;
}

export const SidebarUser = ({ user, onClick }: SidebarUserProps) => {
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3 p-2 mt-4 shrink-0 cursor-pointer hover:bg-white/5 rounded-2xl transition-all group"
    >
      <img 
        src={user.image || 'https://avatar.iran.liara.run/public/job/designer/male'} 
        alt="Avatar" 
        className="w-10 h-10 rounded-full border border-white/10 group-hover:border-brand-accent/50 transition-colors"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate group-hover:text-brand-accent transition-colors">{user.name}</p>
        <p className="text-xs text-gray-500 truncate">{user.phone || 'No phone set'}</p>
      </div>
      <ChevronDown size={16} className="text-gray-500 group-hover:text-white transition-colors" />
    </div>
  );
};
