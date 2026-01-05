import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

export const SidebarItem = ({ icon: Icon, label, href, active }: SidebarItemProps) => {
  return (
    <Link 
      href={href}
      prefetch={false}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
        active 
          ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/20" 
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );
};
