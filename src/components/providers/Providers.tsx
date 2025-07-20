'use client';

import { ReactNode } from 'react';
import { UPProvider } from '@/providers/UPProvider';

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <UPProvider>
      {children}
    </UPProvider>
  );
};