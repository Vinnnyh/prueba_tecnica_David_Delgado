import React from 'react';

interface WelcomeMessageProps {
  name?: string;
}

export const WelcomeMessage = ({ name }: WelcomeMessageProps) => {
  const firstName = name?.split(' ')[0] || 'User';

  return (
    <div>
      <h2 className='text-xl font-bold'>
        Welcome back, <span className='text-brand-accent'>{firstName}</span>! 👋
      </h2>
    </div>
  );
};
