'use client';

import { useUP } from '@/contexts/UPContext';

// Compatibility layer to map useUP to the old useUPProvider interface
export const useUPProvider = () => {
  const {
    web3,
    isConnected,
    connecting,
    address,
    error,
    connectUP,
    disconnectUP,
    isInitialized,
    provider
  } = useUP();

  // Map to the old interface
  return {
    web3,
    provider,
    account: address,
    contextAccount: address, // For compatibility
    chainId: 42, // Default to LUKSO mainnet, can be updated if needed
    isConnected,
    loading: connecting || !isInitialized,
    error,
    connect: connectUP,
    disconnect: disconnectUP,
    switchNetwork: async (targetChainId: number) => {
      // This can be implemented if needed
      console.log('Switch network not implemented in UPContext');
    },
    refreshConnection: async () => {
      // This can be implemented if needed
      console.log('Refresh connection not implemented in UPContext');
    },
    isCorrectChain: true // Assuming we're on the correct chain
  };
};