import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/atoms/button';

interface UserActionsProps {
  onLogout: () => void;
}

export const UserActions = ({ onLogout }: UserActionsProps) => {
  return (
    <div className='flex items-center gap-4'>
      <Button
        variant='danger'
        onClick={onLogout}
        leftIcon={<LogOut size={18} />}
      >
        Sign Out
      </Button>
    </div>
  );
};
