import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { MainLayout } from '@/components/templates/main-layout';
import { useRouter } from 'next/router';
import { Provider as JotaiProvider } from 'jotai';
import { JotaiInitializer } from '@/providers/jotai-provider';
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

  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <JotaiInitializer>
          {isNoLayout ? (
            <Component {...pageProps} />
          ) : (
            <MainLayout key={router.asPath}>
              <Component {...pageProps} />
            </MainLayout>
          )}
        </JotaiInitializer>
      </JotaiProvider>
    </QueryClientProvider>
  );
};

export default App;
