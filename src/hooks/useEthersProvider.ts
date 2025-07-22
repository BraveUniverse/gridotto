'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export function useEthersProvider() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initProvider = async () => {
      try {
        if (!window.ethereum) {
          setError('No wallet detected. Please install a Web3 wallet.');
          setLoading(false);
          return;
        }

        // Create provider
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(ethersProvider);

        // Get network
        const network = await ethersProvider.getNetwork();
        setChainId(Number(network.chainId));

        // Check if connected
        const accounts = await ethersProvider.listAccounts();
        if (accounts.length > 0) {
          const ethersSigner = await ethersProvider.getSigner();
          setSigner(ethersSigner);
          const address = await ethersSigner.getAddress();
          setAccount(address);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error initializing provider:', err);
        setError('Failed to initialize Web3 provider');
        setLoading(false);
      }
    };

    initProvider();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          initProvider(); // Reinitialize to get new signer
        } else {
          setAccount(null);
          setSigner(null);
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        setChainId(parseInt(chainId, 16));
        initProvider(); // Reinitialize on chain change
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const connect = async () => {
    if (!provider) {
      throw new Error('No provider available');
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const ethersSigner = await provider.getSigner();
      setSigner(ethersSigner);
      const address = await ethersSigner.getAddress();
      setAccount(address);
      return address;
    } catch (err) {
      console.error('Error connecting wallet:', err);
      throw err;
    }
  };

  const disconnect = () => {
    setAccount(null);
    setSigner(null);
  };

  const switchToLuksoTestnet = async () => {
    if (!window.ethereum) return;

    const luksoTestnetParams = {
      chainId: '0x1069', // 4201 in hex
      chainName: 'LUKSO Testnet',
      nativeCurrency: {
        name: 'LYX',
        symbol: 'LYX',
        decimals: 18
      },
      rpcUrls: ['https://rpc.testnet.lukso.network'],
      blockExplorerUrls: ['https://explorer.execution.testnet.lukso.network']
    };

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: luksoTestnetParams.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [luksoTestnetParams],
        });
      } else {
        throw switchError;
      }
    }
  };

  return {
    provider,
    signer,
    account,
    chainId,
    loading,
    error,
    connect,
    disconnect,
    switchToLuksoTestnet,
    isConnected: !!account,
    isCorrectChain: chainId === 4201
  };
}