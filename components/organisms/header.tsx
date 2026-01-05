import React from 'react';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/lib/auth/atoms';
import { authClient } from '@/lib/auth/client';
import { useRouter } from 'next/router';
import { WelcomeMessage } from '@/components/molecules/welcome-message';
import { UserActions } from '@/components/molecules/user-actions';

export const Header = () => {
  const user = useAtomValue(userAtom);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push('/login');
    } catch {
      // Handle error
    }
  };

  return (
    <header className='h-20 border-b border-white/5 flex items-center justify-between px-8 shrink-0 bg-brand-bg/50 backdrop-blur-md z-20'>
      <WelcomeMessage name={user?.name} />
      <UserActions onLogout={handleLogout} />
    </header>
  );
};
