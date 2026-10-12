'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => console.log('SW registered successfully:', reg))
          .catch((err) => console.error('SW registration error:', err));
      });
    }
  }, []);

  return null;
}