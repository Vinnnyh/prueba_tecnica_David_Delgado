import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  LogOut,
  ChevronDown,
  ShieldCheck,
  Shield,
  User,
  Phone,
  Save,
  X
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

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { user, role, permissions, isLoading, isAuthLoading, refresh } = useAuth();
  const [isSwitching, setIsSwitching] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileValues, setProfileValues] = useState({ name: '', phone: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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

  const handleOpenProfile = () => {
    setProfileValues({
      name: user?.name || '',
      phone: user?.phone || ''
    });
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileValues)
      });
      
      const data = await res.json();

      if (res.ok) {
        await refresh();
        setIsProfileModalOpen(false);
        window.location.reload();
      } else {
        alert(`Error: ${data.message || 'Failed to update profile'}`);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSavingProfile(false);
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
  const canViewAdmin = isAdmin || permissions.includes('admin:view');
  const canViewUsers = isAdmin || permissions.includes('users:view');
  const canViewRoles = isAdmin || permissions.includes('roles:view');

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg text-white font-sans relative">
      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isSavingProfile && setIsProfileModalOpen(false)}
          />
          <div className="relative bg-brand-bg border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit Profile</h2>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="text"
                    value={profileValues.name}
                    onChange={(e) => setProfileValues(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-brand-accent transition-colors"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="tel"
                    value={profileValues.phone}
                    onChange={(e) => setProfileValues(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-brand-accent transition-colors"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/5 flex gap-3">
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                disabled={isSavingProfile}
                className="flex-1 px-6 py-3 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="flex-1 px-6 py-3 rounded-2xl bg-brand-accent font-bold hover:opacity-90 transition-all shadow-lg shadow-brand-accent/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSavingProfile ? <LoadingDots /> : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-accent/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-purple/10 blur-[120px] rounded-full pointer-events-none" />

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

          {canViewAdmin && (
            <SidebarItem 
              icon={ShieldCheck} 
              label="Admin Panel" 
              href="/admin-dashboard" 
              active={router.pathname === '/admin-dashboard'}
            />
          )}
          
          {canViewUsers && (
            <SidebarItem 
              icon={Users} 
              label="Accounts" 
              href="/accounts" 
              active={router.pathname === '/accounts'}
            />
          )}

          {canViewRoles && (
            <SidebarItem 
              icon={Shield} 
              label="Roles" 
              href="/roles" 
              active={router.pathname === '/roles'}
            />
          )}
          
          <div className="my-4 border-t border-white/5" />
          
          {/* Role Switcher */}
          <div className="mt-auto p-4 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden group">
            {/* Loading Overlay */}
            {isSwitching && (
              <div className="absolute inset-0 bg-brand-sidebar/80 backdrop-blur-[2px] z-10 flex items-center justify-center animate-in fade-in duration-200">
                <LoadingDots color="#9333ea" />
              </div>
            )}
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Role: {role}</span>
              <div 
                onClick={!isSwitching ? handleSwitchRole : undefined}
                className={`w-10 h-5 rounded-full p-1 transition-colors relative ${
                  isSwitching ? 'cursor-not-allowed' : 'cursor-pointer'
                } ${isAdmin ? 'bg-brand-accent' : 'bg-gray-600'}`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isAdmin ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 leading-tight">
              Toggle to switch between Admin and User permissions for the demo.
            </p>
          </div>
        </nav>

        <div 
          onClick={handleOpenProfile}
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 shrink-0 bg-brand-bg/50 backdrop-blur-md z-20">
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
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 min-h-full flex flex-col">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
