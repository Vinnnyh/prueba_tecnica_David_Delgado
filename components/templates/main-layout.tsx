import React, { useState } from 'react';
import { Sidebar } from '@/components/organisms/sidebar';
import { Header } from '@/components/organisms/header';
import { ProfileModal } from '@/components/organisms/profile-modal';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-brand-bg text-white overflow-hidden font-sans selection:bg-brand-accent/30">
      <Sidebar onOpenProfile={() => setIsProfileOpen(true)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto relative">
          <div className="max-w-7xl mx-auto p-8">
            {children}
          </div>
        </main>
      </div>

      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </div>
  );
};
