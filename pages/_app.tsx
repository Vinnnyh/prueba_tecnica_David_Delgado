import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRouter } from 'next/router';
import { AuthProvider } from '@/lib/auth/context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
      },
    },
  }));
  
  // Pages that don't need the dashboard layout (e.g., login)
  const noLayoutPages = ['/login', '/auth'];
  const isNoLayout = noLayoutPages.some(path => router.pathname.startsWith(path));

  const content = isNoLayout ? (
    <Component {...pageProps} />
  ) : (
    <AppLayout>
      <Component {...pageProps} />
    </AppLayout>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {content}
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
