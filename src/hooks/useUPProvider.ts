'use client';

// Compatibility layer for old code
import { useEthers } from '@/contexts/EthersContext';
import { ethers } from 'ethers';

export const useUPProvider = () => {
  const { 
    provider, 
    signer, 
    account, 
    chainId, 
    loading, 
    error, 
    connect, 
    disconnect, 
    switchToLuksoTestnet, 
    isConnected, 
    isCorrectChain 
  } = useEthers();

  // Create Web3-like interface for compatibility
  const web3 = provider ? {
    eth: {
      Contract: (abi: any, address: string) => new ethers.Contract(address, abi, signer || provider),
      getBalance: async (address: string) => {
        const balance = await provider.getBalance(address);
        return balance.toString();
      },
      getAccounts: async () => {
        return account ? [account] : [];
      }
    },
    utils: {
      fromWei: (value: string, unit: string) => ethers.formatEther(value),
      toWei: (value: string, unit: string) => ethers.parseEther(value).toString(),
      padLeft: (value: string, length: number) => ethers.zeroPadValue(value, length / 2),
      toHex: (value: string | number) => ethers.toBeHex(value)
    }
  } : null;

  const refreshConnection = async () => {
    if (!isConnected) {
      await connect();
    }
  };

  return {
    web3,
    provider,
    signer,
    account,
    contextAccount: account, // For compatibility
    chainId,
    loading,
    error,
    connect,
    disconnect,
    switchNetwork: switchToLuksoTestnet,
    refreshConnection,
    isConnected,
    isCorrectChain
  };
};