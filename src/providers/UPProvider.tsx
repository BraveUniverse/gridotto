'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useUPProvider } from '@/hooks/useUPProvider';
import Web3 from 'web3';

interface UPContextType {
  web3: Web3 | null;
  provider: any;
  account: string | null;
  contextAccount: string | null;
  chainId: number | null;
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  connect: () => Promise<string | undefined>;
  disconnect: () => void;
  switchNetwork: (targetChainId: number) => Promise<void>;
  refreshConnection: () => Promise<void>;
  isCorrectChain: boolean;
}

const UPContext = createContext<UPContextType | undefined>(undefined);

export function UPProvider({ children }: { children: ReactNode }) {
  const upProvider = useUPProvider();

  return (
    <UPContext.Provider value={upProvider}>
      {children}
    </UPContext.Provider>
  );
}

export function useUP() {
  const context = useContext(UPContext);
  if (context === undefined) {
    throw new Error('useUP must be used within a UPProvider');
  }
  return context;
}