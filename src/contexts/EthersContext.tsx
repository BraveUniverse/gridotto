'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useEthersProvider } from '@/hooks/useEthersProvider';
import { ethers } from 'ethers';

interface EthersContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
  loading: boolean;
  error: string | null;
  connect: () => Promise<string>;
  disconnect: () => void;
  switchToLuksoTestnet: () => Promise<void>;
  isConnected: boolean;
  isCorrectChain: boolean;
}

const EthersContext = createContext<EthersContextType | undefined>(undefined);

export function EthersProvider({ children }: { children: ReactNode }) {
  const ethersProvider = useEthersProvider();

  return (
    <EthersContext.Provider value={ethersProvider}>
      {children}
    </EthersContext.Provider>
  );
}

export function useEthers() {
  const context = useContext(EthersContext);
  if (context === undefined) {
    throw new Error('useEthers must be used within an EthersProvider');
  }
  return context;
}