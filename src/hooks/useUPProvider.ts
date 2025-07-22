'use client';

import { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';

export const useUPProvider = () => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [contextAccount, setContextAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeProvider = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if window.lukso is available
      let providerInstance: any;
      
      if (window.lukso) {
        providerInstance = window.lukso;
      } else if (window.ethereum) {
        // Fallback to window.ethereum if lukso is not available
        providerInstance = window.ethereum;
      } else {
        setError('No Web3 provider found. Please install UP Browser Extension.');
        setLoading(false);
        return;
      }

      // Set provider
      setProvider(providerInstance);

      // Create Web3 instance
      const web3Instance = new Web3(providerInstance);
      setWeb3(web3Instance);

      // Check if already connected
      try {
        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setContextAccount(accounts[0]);
          setIsConnected(true);

          // Get chain ID
          const id = await web3Instance.eth.getChainId();
          setChainId(Number(id));
        }
      } catch (err) {
        console.log('Not connected yet');
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Error initializing provider:', err);
      setError(err.message || 'Failed to initialize Web3 provider');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeProvider();
  }, [initializeProvider]);

  useEffect(() => {
    if (!provider) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setContextAccount(accounts[0]);
        setIsConnected(true);
      } else {
        setAccount(null);
        setContextAccount(null);
        setIsConnected(false);
      }
    };

    const handleChainChanged = (chainId: string) => {
      setChainId(parseInt(chainId, 16));
      // Reload the page to reset the state
      window.location.reload();
    };

    const handleConnect = ({ chainId }: { chainId: string }) => {
      setChainId(parseInt(chainId, 16));
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setAccount(null);
      setContextAccount(null);
      setIsConnected(false);
      setChainId(null);
    };

    // Set up event listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('connect', handleConnect);
      window.ethereum.on('disconnect', handleDisconnect);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('connect', handleConnect);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [provider]);

  const connect = useCallback(async () => {
    if (!provider || !web3) {
      throw new Error('Provider not initialized');
    }

    try {
      // Request accounts using UP Provider
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setContextAccount(accounts[0]);
        setIsConnected(true);

        // Get chain ID
        const id = await web3.eth.getChainId();
        setChainId(Number(id));

        return accounts[0];
      }
    } catch (err: any) {
      console.error('Error connecting:', err);
      throw err;
    }
  }, [provider, web3]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setContextAccount(null);
    setIsConnected(false);
  }, []);

  const switchNetwork = useCallback(async (targetChainId: number) => {
    if (!provider) {
      throw new Error('Provider not initialized');
    }

    const chainIdHex = `0x${targetChainId.toString(16)}`;

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to the wallet
      if (switchError.code === 4902) {
        // Handle adding the chain
        throw new Error('Please add LUKSO Testnet to your wallet');
      }
      throw switchError;
    }
  }, [provider]);

  const refreshConnection = useCallback(async () => {
    if (!web3) return;

    try {
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setContextAccount(accounts[0]);
        setIsConnected(true);
      } else {
        await connect();
      }
    } catch (err) {
      console.error('Error refreshing connection:', err);
    }
  }, [web3, connect]);

  return {
    web3,
    provider,
    account,
    contextAccount,
    chainId,
    isConnected,
    loading,
    error,
    connect,
    disconnect,
    switchNetwork,
    refreshConnection,
    isCorrectChain: chainId === 4201, // LUKSO Testnet
  };
};