import React from 'react';

export const SidebarLogo = () => {
  return (
    <div className='flex items-center gap-2 px-2'>
      <div className='w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center'>
        <div className='w-4 h-4 bg-white rounded-full opacity-80' />
      </div>
      <span className='text-xl font-bold tracking-tight'>
        Balance<span className='text-xs align-top'>™</span>
      </span>
    </div>
  );
};
