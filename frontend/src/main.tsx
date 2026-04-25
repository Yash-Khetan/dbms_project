import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import App from './App.tsx';

// Import fonts
import '@fontsource/syne';
import '@fontsource/ibm-plex-mono';
import '@fontsource/inter';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e293b', // slate-800
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: 'Inter, sans-serif'
          },
          success: {
            iconTheme: {
              primary: '#00E396',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF3D57',
              secondary: '#fff',
            },
          },
        }}
      />
    </QueryClientProvider>
  </StrictMode>
);
