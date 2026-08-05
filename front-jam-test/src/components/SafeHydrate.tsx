'use client';

import { useEffect, useState } from 'react';

export default function SafeHydrate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Nettoyage des listeners potentiellement problématiques
    const cleanup = () => {
      if (window.removeEventListener) {
        window.removeEventListener('load', cleanup);
      }
    };

    if (window.addEventListener) {
      window.addEventListener('load', cleanup);
    }

    return () => {
      cleanup();
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' ? null : children}
    </div>
  );
}
