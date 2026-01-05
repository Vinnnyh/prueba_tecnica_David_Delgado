import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Shield
} from 'lucide-react';
import { useAtomValue } from 'jotai';
import { userAtom, roleAtom, permissionsAtom } from '@/lib/auth/atoms';
import { SidebarItem } from '@/components/molecules/sidebar-item';
import { SidebarLogo } from '@/components/molecules/sidebar-logo';
import { RoleSwitcher } from '@/components/molecules/role-switcher';
import { SidebarUser } from '@/components/molecules/sidebar-user';

interface SidebarProps {
  onOpenProfile: () => void;
}

export const Sidebar = ({ onOpenProfile }: SidebarProps) => {
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const role = useAtomValue(roleAtom);
  const permissions = useAtomValue(permissionsAtom);
  const [isSwitching, setIsSwitching] = useState(false);

  const isAdmin = role === 'ADMIN';
  const canViewAdmin = isAdmin || permissions.includes('admin:view');
  const canViewUsers = isAdmin || permissions.includes('users:view');
  const canViewRoles = isAdmin || permissions.includes('roles:view');

  const handleSwitchRole = async () => {
    setIsSwitching(true);
    const targetRole = role === 'ADMIN' ? 'USER' : 'ADMIN';
    
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole }),
      });

      if (res.ok) {
        localStorage.removeItem(`auth_${user?.id}`);
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to switch role', error);
    } finally {
      setIsSwitching(false);
    }
  };

  if (!user) return null;

  return (
    <aside className="w-64 h-full bg-brand-sidebar border-r border-white/5 flex flex-col p-6 gap-8 shrink-0">
      <SidebarLogo />

      <nav className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2">
        <SidebarItem 
          icon={LayoutDashboard} 
          label="Dashboard" 
          href="/" 
          active={router.asPath === '/'} 
        />

        {canViewAdmin && (
          <SidebarItem 
            icon={ShieldCheck} 
            label="Admin Panel" 
            href="/admin-dashboard" 
            active={router.asPath === '/admin-dashboard'}
          />
        )}
        
        {canViewUsers && (
          <SidebarItem 
            icon={Users} 
            label="Accounts" 
            href="/accounts" 
            active={router.asPath === '/accounts'}
          />
        )}

        {canViewRoles && (
          <SidebarItem 
            icon={Shield} 
            label="Roles" 
            href="/roles" 
            active={router.asPath === '/roles'}
          />
        )}
        
        <div className="my-4 border-t border-white/5" />
        
        <RoleSwitcher 
          role={role}
          isAdmin={isAdmin}
          isSwitching={isSwitching}
          onSwitch={handleSwitchRole}
        />
      </nav>

      <SidebarUser 
        user={user}
        onClick={onOpenProfile}
      />
    </aside>
  );
};
