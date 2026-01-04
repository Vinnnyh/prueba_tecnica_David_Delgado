import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  LogOut,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { authClient } from '@/lib/auth/client';
import { LoadingDots } from '@/components/ui/loading-dots';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem = ({ icon: Icon, label, href, active }: SidebarItemProps) => {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { user, role, permissions, isLoading, isAuthLoading, refresh } = useAuth();
  const [isSwitching, setIsSwitching] = useState(false);

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
        // Clear local cache before reload to ensure fresh data
        localStorage.removeItem(`auth_${user.id}`);
        // Full reload to clear all states and re-fetch everything
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to switch role', error);
    } finally {
      setIsSwitching(false);
    }
  };

  if (isLoading || isAuthLoading) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <LoadingDots />
    </div>
  );

  if (!user) {
    return null;
  }

  const isAdmin = role === 'ADMIN';
  const canViewUsers = permissions.includes('users:view');

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 h-full bg-brand-sidebar border-r border-white/5 flex flex-col p-6 gap-8 shrink-0">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full opacity-80" />
          </div>
          <span className="text-xl font-bold tracking-tight">Balance<span className="text-xs align-top">™</span></span>
        </div>

        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            href="/" 
            active={router.pathname === '/'} 
          />

          {canViewUsers && (
            <SidebarItem 
              icon={ShieldCheck} 
              label="Admin Panel" 
              href="/admin-dashboard" 
              active={router.pathname === '/admin-dashboard'}
            />
          )}
          
          <SidebarItem 
            icon={Wallet} 
            label="My Wallet" 
            href="/movements" 
            active={router.pathname === '/movements'}
          />
          
          {canViewUsers && (
            <SidebarItem 
              icon={Users} 
              label="Accounts" 
              href="/accounts" 
              active={router.pathname === '/accounts'}
            />
          )}
          
          <div className="my-4 border-t border-white/5" />
          
          {/* Role Switcher */}
          <div className="mt-auto p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Role: {role}</span>
              <div 
                onClick={!isSwitching ? handleSwitchRole : undefined}
                className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${isAdmin ? 'bg-brand-accent' : 'bg-gray-600'}`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isAdmin ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 leading-tight">
              Toggle to switch between Admin and User permissions for the demo.
            </p>
          </div>
        </nav>

        <div className="flex items-center gap-3 p-2 mt-4 shrink-0">
          <img 
            src={user.image || 'https://avatar.iran.liara.run/public/job/designer/male'} 
            alt="Avatar" 
            className="w-10 h-10 rounded-full border border-white/10"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">Web Developer</p>
          </div>
          <ChevronDown size={16} className="text-gray-500" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-xl font-bold">Welcome Back, {user.name?.split(' ')[0]} 👋</h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={async () => {
                await authClient.signOut();
                router.push('/login');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all border border-white/5 hover:border-red-500/20 text-sm font-bold"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
