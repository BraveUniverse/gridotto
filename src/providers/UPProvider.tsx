'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import Web3 from 'web3';
import { CONTRACTS } from '@/config/contracts';
import { createClientUPProvider } from '@lukso/up-provider';
import type { EthExecutionAPI, SupportedProviders } from 'web3';

interface UPContextType {
  isConnected: boolean;
  account: string | null;
  contextAccount: string | null;
  chainId: number | null;
  providerError: string | null;
  refreshConnection: () => Promise<boolean>;
  web3: Web3 | null;
  provider: any | null;
}

export const UPContext = createContext<UPContextType>({
  isConnected: false,
  account: null,
  contextAccount: null,
  chainId: null,
  providerError: null,
  refreshConnection: async () => false,
  web3: null,
  provider: null,
});

interface UPProviderProps {
  children: ReactNode;
}

export const UPProvider = ({ children }: UPProviderProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [contextAccount, setContextAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [providerError, setProviderError] = useState<string | null>(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [provider, setProvider] = useState<any | null>(null);

  const refreshConnection = async (): Promise<boolean> => {
    try {
      if (typeof window === 'undefined') {
        return false;
      }

      const upProvider = createClientUPProvider();
      const web3Instance = new Web3(upProvider as unknown as SupportedProviders<EthExecutionAPI>);
      
      const accounts = await web3Instance.eth.requestAccounts();
      const chainId = await web3Instance.eth.getChainId();

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setContextAccount(accounts[0]);
        setChainId(Number(chainId));
        setIsConnected(true);
        setWeb3(web3Instance);
        setProvider(upProvider);
        setProviderError(null);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Connection error:', error);
      setProviderError(error.message || 'Failed to connect');
      setIsConnected(false);
      return false;
    }
  };

  useEffect(() => {
    // Try to connect on mount
    refreshConnection();
  }, []);

  const value: UPContextType = {
    isConnected,
    account,
    contextAccount,
    chainId,
    providerError,
    refreshConnection,
    web3,
    provider,
  };

  return <UPContext.Provider value={value}>{children}</UPContext.Provider>;
};