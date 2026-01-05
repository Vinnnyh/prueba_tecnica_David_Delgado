import { authClient } from '@/lib/auth/client';
import { Github } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/atoms/button';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: 'github',
        callbackURL: '/',
      });
    } catch (error) {
      alert(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-brand-bg flex items-center justify-center p-4'>
      <div className='w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl'>
        <div className='flex flex-col items-center gap-6'>
          <div className='w-16 h-16 bg-brand-accent rounded-2xl flex items-center justify-center shadow-lg shadow-brand-accent/20'>
            <div className='w-8 h-8 bg-white rounded-full opacity-80' />
          </div>

          <div className='text-center'>
            <h1 className='text-3xl font-bold text-white mb-2'>
              Welcome to Balance
            </h1>
            <p className='text-gray-400'>Sign in to manage your finances</p>
          </div>

          <Button
            onClick={handleLogin}
            isLoading={isLoading}
            className='w-full py-4 rounded-2xl min-h-[60px] bg-white text-black hover:bg-gray-200'
            leftIcon={<Github size={24} />}
          >
            Continue with GitHub
          </Button>

          <p className='text-xs text-gray-500 text-center px-8'>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
