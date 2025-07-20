'use client';

import { useContext } from 'react';
import { UPContext } from '@/providers/UPProvider';

export const useUPProvider = () => {
  const context = useContext(UPContext);
  
  if (!context) {
    throw new Error('useUPProvider must be used within UPProvider');
  }
  
  return context;
};