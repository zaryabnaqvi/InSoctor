import { useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeProvider';
import { AppLayout } from './components/layout/AppLayout';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from '@/components/ui/toaster';
import { UserProvider } from './contexts/UserContext';
import { AlertProvider } from './contexts/AlertContext';

import './App.css';

function App() {
  // Set page title
  useEffect(() => {
    document.title = 'INSOCtor | Security Operations Platform';
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="sentinel-theme">
      <UserProvider>
        <AlertProvider>
          <AppLayout>
            <AppRoutes />
          </AppLayout>

          <Toaster />
        </AlertProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;