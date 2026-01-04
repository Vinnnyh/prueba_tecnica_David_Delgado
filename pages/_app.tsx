// @ts-ignore
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/router';
import { AuthProvider } from '@/lib/auth/context';

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  
  // Pages that don't need the dashboard layout (e.g., login)
  const noLayoutPages = ['/login', '/auth'];
  const isNoLayout = noLayoutPages.some(path => router.pathname.startsWith(path));

  const content = isNoLayout ? (
    <Component {...pageProps} />
  ) : (
    <DashboardLayout>
      <Component {...pageProps} />
    </DashboardLayout>
  );

  return (
    <AuthProvider>
      {content}
    </AuthProvider>
  );
};

export default App;
