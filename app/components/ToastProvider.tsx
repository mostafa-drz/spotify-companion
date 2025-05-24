'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        },
        success: {
          iconTheme: {
            primary: 'var(--success)',
            secondary: 'var(--background)',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--error)',
            secondary: 'var(--background)',
          },
        },
      }}
    />
  );
} 