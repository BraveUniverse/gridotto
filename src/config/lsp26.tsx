'use client';

import { ethers } from 'ethers';
import { useUPProvider } from '../hooks/useUPProvider';
import Web3 from 'web3';
import type { EthExecutionAPI, SupportedProviders } from 'web3';
import React, { createContext, useContext, type ReactNode } from 'react';

// LSP26 Follower System contract address
export const LSP26_CONTRACT_ADDRESS = '0xf01103E5a9909Fc0DBe8166dA7085e0285daDDcA';

// LUKSO dokümantasyonuna göre güncellenmiş LSP26 ABI - Resmi LSP26 Follower System ABI
const LSP26_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "follower",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "name": "Follow",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "unfollower",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "name": "Unfollow",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "name": "follow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "addresses",
        "type": "address[]"
      }
    ],
    "name": "followBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "name": "followerCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "name": "followingCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "startIndex",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endIndex",
        "type": "uint256"
      }
    ],
    "name": "getFollowersByIndex",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "startIndex",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endIndex",
        "type": "uint256"
      }
    ],
    "name": "getFollowsByIndex",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "follower",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "name": "isFollowing",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "name": "unfollow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "addresses",
        "type": "address[]"
      }
    ],
    "name": "unfollowBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const PAGE_SIZE = 50; // Maximum number of followers to fetch at once

// LSP26 için Context tanımı - LSP26FollowerSystem yerine kullanılacak
export interface LSP26Context {
  provider: any;
  web3: any;
  account: string | null;
  isConnected: boolean;
  
  // LSP26 methods
  getFollowerCount: (address: string) => Promise<number>;
  getFollowingCount: (address: string) => Promise<number>;
  getFollowers: (address: string, startIndex?: number) => Promise<string[]>;
  getFollowing: (address: string, startIndex?: number) => Promise<string[]>;
  getAllFollowers: (address: string) => Promise<string[]>;
  getAllFollowing: (address: string) => Promise<string[]>;
  getMutualConnections: (address: string) => Promise<{
    allFollowers: string[];
    allFollowing: string[];
    mutualConnections: string[];
    mutualCount: number;
  }>;
  isFollowing: (followerAddress: string, targetAddress: string) => Promise<boolean>;
  follow: (targetAddress: string) => Promise<boolean>;
  unfollow: (targetAddress: string) => Promise<boolean>;
  followMany: (targetAddresses: string[]) => Promise<boolean>;
  unfollowMany: (targetAddresses: string[]) => Promise<boolean>;
  checkFollowRelation: (address1: string, address2: string) => Promise<{
    address1FollowsAddress2: boolean;
    address2FollowsAddress1: boolean;
    isMutual: boolean;
  }>;
}

// Global LSP26 context
const LSP26ContextObj = createContext<LSP26Context | null>(null);

// React hook için LSP26 servisini oluştur
export const useLSP26 = (): LSP26Context => {
  const { provider, web3, isConnected, account } = useUPProvider();
  
  // Get follower count
  const getFollowerCount = async (address: string): Promise<number> => {
    try {
      if (!web3) return 0;
      
      const contract = new web3.eth.Contract(LSP26_ABI, LSP26_CONTRACT_ADDRESS);
      const data = await contract.methods.followerCount(address).call();
      return Number(data);
    } catch (error) {
      console.error('Error getting follower count:', error);
      return 0;
    }
  };

  // Get following count
  const getFollowingCount = async (address: string): Promise<number> => {
    try {
      if (!web3) return 0;
      
      const contract = new web3.eth.Contract(LSP26_ABI, LSP26_CONTRACT_ADDRESS);
      const data = await contract.methods.followingCount(address).call();
      return Number(data);
    } catch (error) {
      console.error('Error getting following count:', error);
      return 0;
    }
  };

  // Get followers (paginated)
  const getFollowers = async (address: string, startIndex: number = 0): Promise<string[]> => {
    try {
      if (!web3) return [];
      
      const followerCount = await getFollowerCount(address);
      if (followerCount === 0) return [];

      const endIndex = Math.min(startIndex + PAGE_SIZE, followerCount);
      
      const contract = new web3.eth.Contract(LSP26_ABI, LSP26_CONTRACT_ADDRESS);
      const data = await contract.methods.getFollowersByIndex(address, startIndex, endIndex).call();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error getting followers:', error);
      return [];
    }
  };

  // Get following (paginated)
  const getFollowing = async (address: string, startIndex: number = 0): Promise<string[]> => {
    try {
      if (!web3) return [];
      
      const followingCount = await getFollowingCount(address);
      if (followingCount === 0) return [];

      const endIndex = Math.min(startIndex + PAGE_SIZE, followingCount);
      
      const contract = new web3.eth.Contract(LSP26_ABI, LSP26_CONTRACT_ADDRESS);
      const data = await contract.methods.getFollowsByIndex(address, startIndex, endIndex).call();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error getting following:', error);
      return [];
    }
  };

  // Get all followers in a single call
  const getAllFollowers = async (address: string): Promise<string[]> => {
    try {
      if (!web3) return [];
      
      const followerCount = await getFollowerCount(address);
      if (followerCount === 0) return [];

      // Get all followers in a single call
      const contract = new web3.eth.Contract(LSP26_ABI, LSP26_CONTRACT_ADDRESS);
      const data = await contract.methods.getFollowersByIndex(address, 0, followerCount).call();
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error getting all followers:', error);
      return [];
    }
  };

  // Get all following in a single call
  const getAllFollowing = async (address: string): Promise<string[]> => {
    try {
      if (!web3) return [];
      
      const followingCount = await getFollowingCount(address);
      if (followingCount === 0) return [];

      // Get all following in a single call
      const contract = new web3.eth.Contract(LSP26_ABI, LSP26_CONTRACT_ADDRESS);
      const data = await contract.methods.getFollowsByIndex(address, 0, followingCount).call();
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error getting all following:', error);
      return [];
    }
  };

  // Optimized method to calculate mutual connections in a single operation
  const getMutualConnections = async (address: string): Promise<{
    allFollowers: string[];
    allFollowing: string[];
    mutualConnections: string[];
    mutualCount: number;
  }> => {
    try {
      if (!web3) {
        return {
          allFollowers: [],
          allFollowing: [],
          mutualConnections: [],
          mutualCount: 0
        };
      }
      
      // Get counts
      const [followerCount, followingCount] = await Promise.all([
        getFollowerCount(address),
        getFollowingCount(address)
      ]);
      
      if (followerCount === 0 || followingCount === 0) {
        return {
          allFollowers: [],
          allFollowing: [],
          mutualConnections: [],
          mutualCount: 0
        };
      }

      // Get all followers and following in parallel
      const [allFollowers, allFollowing] = await Promise.all([
        getAllFollowers(address),
        getAllFollowing(address)
      ]);

      // Calculate mutual connections using Set intersections
      const followerSet = new Set(allFollowers.map(addr => addr.toLowerCase()));
      const followingSet = new Set(allFollowing.map(addr => addr.toLowerCase()));
      
      // Find mutual connections
      const mutualConnections: string[] = [];
      
      for (const addr of allFollowing) {
        const lowerAddr = addr.toLowerCase();
        if (followerSet.has(lowerAddr)) {
          mutualConnections.push(lowerAddr);
        }
      }
      
      // Remove duplicates
      const uniqueMutualSet = new Set(mutualConnections);
      const mutualCount = uniqueMutualSet.size;
      
      return {
        allFollowers,
        allFollowing,
        mutualConnections: Array.from(uniqueMutualSet),
        mutualCount
      };
    } catch (error) {
      console.error('Error calculating mutual connections:', error);
      return {
        allFollowers: [],
        allFollowing: [],
        mutualConnections: [],
        mutualCount: 0
      };
    }
  };

  // Check if one address follows another
  const isFollowing = async (followerAddress: string, targetAddress: string): Promise<boolean> => {
    try {
      if (!web3) return false;
      
      const contract = new web3.eth.Contract(LSP26_ABI, LSP26_CONTRACT_ADDRESS);
      const data = await contract.methods.isFollowing(followerAddress, targetAddress).call();
      return Boolean(data);
    } catch (error) {
      console.error('Error checking following:', error);
      return false;
    }
  };

  // Follow a profile
  const follow = async (targetAddress: string): Promise<boolean> => {
    try {
      if (!provider || !isConnected) {
        throw new Error('Provider not available or not connected');
      }
      
      const ethersProvider = new ethers.providers.Web3Provider(provider as any);
      const signer = ethersProvider.getSigner();
      const contract = new ethers.Contract(LSP26_CONTRACT_ADDRESS, LSP26_ABI, signer);
      
      // Send transaction
      const tx = await contract.follow(targetAddress);
      const receipt = await tx.wait();
      
      console.log('Follow transaction hash:', receipt.transactionHash);
      return true;
    } catch (error) {
      console.error('Error following:', error);
      throw error;
    }
  };

  // Unfollow a profile
  const unfollow = async (targetAddress: string): Promise<boolean> => {
    try {
      if (!provider || !isConnected) {
        throw new Error('Provider not available or not connected');
      }
      
      const ethersProvider = new ethers.providers.Web3Provider(provider as any);
      const signer = ethersProvider.getSigner();
      const contract = new ethers.Contract(LSP26_CONTRACT_ADDRESS, LSP26_ABI, signer);
      
      // Send transaction
      const tx = await contract.unfollow(targetAddress);
      const receipt = await tx.wait();
      
      console.log('Unfollow transaction hash:', receipt.transactionHash);
      return true;
    } catch (error) {
      console.error('Error unfollowing:', error);
      throw error;
    }
  };

  // Batch follow multiple profiles
  const followMany = async (targetAddresses: string[]): Promise<boolean> => {
    try {
      // Check if array is empty
      if (targetAddresses.length === 0) {
        return true; // No addresses to process
      }
      
      if (!provider || !isConnected) {
        throw new Error('Provider not available or not connected');
      }
      
      // Maximum 50 addresses should be processed
      const MAX_BATCH_SIZE = 50;
      if (targetAddresses.length > MAX_BATCH_SIZE) {
        console.warn(`Batch operation supports a maximum of ${MAX_BATCH_SIZE} addresses. Only the first ${MAX_BATCH_SIZE} addresses will be processed.`);
        targetAddresses = targetAddresses.slice(0, MAX_BATCH_SIZE);
      }
      
      const ethersProvider = new ethers.providers.Web3Provider(provider as any);
      const signer = ethersProvider.getSigner();
      const contract = new ethers.Contract(LSP26_CONTRACT_ADDRESS, LSP26_ABI, signer);
      
      // Send transaction
      const tx = await contract.followBatch(targetAddresses);
      const receipt = await tx.wait();
      
      console.log('Batch follow transaction hash:', receipt.transactionHash);
      return true;
    } catch (error) {
      console.error('Error batch following:', error);
      throw error;
    }
  };

  // Batch unfollow multiple profiles
  const unfollowMany = async (targetAddresses: string[]): Promise<boolean> => {
    try {
      // Check if array is empty
      if (targetAddresses.length === 0) {
        return true; // No addresses to process
      }
      
      if (!provider || !isConnected) {
        throw new Error('Provider not available or not connected');
      }
      
      // Maximum 50 addresses should be processed
      const MAX_BATCH_SIZE = 50;
      if (targetAddresses.length > MAX_BATCH_SIZE) {
        console.warn(`Batch operation supports a maximum of ${MAX_BATCH_SIZE} addresses. Only the first ${MAX_BATCH_SIZE} addresses will be processed.`);
        targetAddresses = targetAddresses.slice(0, MAX_BATCH_SIZE);
      }
      
      const ethersProvider = new ethers.providers.Web3Provider(provider as any);
      const signer = ethersProvider.getSigner();
      const contract = new ethers.Contract(LSP26_CONTRACT_ADDRESS, LSP26_ABI, signer);
      
      // Send transaction
      const tx = await contract.unfollowBatch(targetAddresses);
      const receipt = await tx.wait();
      
      console.log('Batch unfollow transaction hash:', receipt.transactionHash);
      return true;
    } catch (error) {
      console.error('Error batch unfollowing:', error);
      throw error;
    }
  };

  // Check follow relationship between two addresses
  const checkFollowRelation = async (address1: string, address2: string): Promise<{
    address1FollowsAddress2: boolean;
    address2FollowsAddress1: boolean;
    isMutual: boolean;
  }> => {
    try {
      const [follows1to2, follows2to1] = await Promise.all([
        isFollowing(address1, address2),
        isFollowing(address2, address1)
      ]);

      return {
        address1FollowsAddress2: follows1to2,
        address2FollowsAddress1: follows2to1,
        isMutual: follows1to2 && follows2to1
      };
    } catch (error) {
      console.error('Error checking follow relationship:', error);
      throw error;
    }
  };

  return {
    // Provider ve Account bilgileri
    provider,
    web3,
    account,
    isConnected,
    
    // LSP26 Follower System fonksiyonları
    getFollowerCount,
    getFollowingCount,
    getFollowers,
    getFollowing,
    getAllFollowers,
    getAllFollowing,
    getMutualConnections,
    isFollowing,
    checkFollowRelation,
    follow,
    unfollow,
    followMany,
    unfollowMany
  };
};

// LSP26FollowerSystem sınıfı - BuyTicketModal gibi bileşenler için geriye uyumluluk sağlar
export class LSP26FollowerSystem {
  private lsp26Context: LSP26Context | null = null;
  
  constructor() {
    // Otomatik olarak global context'i kullanıyoruz
    // BuyTicketModal içindeki mevcut kullanımla uyumlu olması için
    if (typeof window !== 'undefined') {
      // Uygulama içinde LSP26Provider kullanıldığında
      // window._LSP26Context değeri atanmış olacak
      const win = window as any;
      if (win._LSP26Context) {
        this.lsp26Context = win._LSP26Context;
      } else {
        console.warn('LSP26 context not initialized yet. Make sure to use LSP26Provider.');
      }
    }
  }
  
  // Provider ve web3 instance'ı ayarlamak için (genellikle gerekli olmayacak)
    setContext(context: LSP26Context) {
    this.lsp26Context = context;
  }
  
  // Get follower count
  async getFollowerCount(address: string): Promise<number> {
    if (!this.lsp26Context) {
      // Fallback: Context yoksa direkt useUPProvider'dan bir hook kullanamayız
      // Bu durumda window'dan provider alıp doğrudan işlem yapmamız gerekir
      try {
        const provider = (window as any).lukso || (window as any).ethereum;
        if (provider) {
          const web3 = new Web3(provider as any);
          const contract = new web3.eth.Contract(LSP26_ABI as any, LSP26_CONTRACT_ADDRESS);
          const data = await contract.methods.followerCount(address).call();
          return Number(data);
        }
        return 0;
      } catch (error) {
        console.error('Error getting follower count (fallback):', error);
        return 0;
      }
    }
    
    return this.lsp26Context.getFollowerCount(address);
  }
  
  // Get following count
  async getFollowingCount(address: string): Promise<number> {
    if (!this.lsp26Context) {
      // Fallback işlemi
      try {
        const provider = (window as any).lukso || (window as any).ethereum;
        if (provider) {
          const web3 = new Web3(provider as any);
          const contract = new web3.eth.Contract(LSP26_ABI as any, LSP26_CONTRACT_ADDRESS);
          const data = await contract.methods.followingCount(address).call();
          return Number(data);
        }
        return 0;
      } catch (error) {
        console.error('Error getting following count (fallback):', error);
        return 0;
      }
    }
    
    return this.lsp26Context.getFollowingCount(address);
  }
  
  // Get followers (paginated)
  async getFollowers(address: string, startIndex: number = 0): Promise<string[]> {
    if (!this.lsp26Context) {
      // Fallback işlemi
      try {
        const provider = (window as any).lukso || (window as any).ethereum;
        if (provider) {
          const web3 = new Web3(provider as any);
          const contract = new web3.eth.Contract(LSP26_ABI as any, LSP26_CONTRACT_ADDRESS);
          
          // First get follower count
          const followerCount = await contract.methods.followerCount(address).call();
          if (Number(followerCount) === 0) return [];
          
          const endIndex = Math.min(startIndex + PAGE_SIZE, Number(followerCount));
          const data = await contract.methods.getFollowersByIndex(address, startIndex, endIndex).call();
          return Array.isArray(data) ? data : [];
        }
        return [];
      } catch (error) {
        console.error('Error getting followers (fallback):', error);
        return [];
      }
    }
    
    return this.lsp26Context.getFollowers(address, startIndex);
  }
  
  // Get following (paginated)
  async getFollowing(address: string, startIndex: number = 0): Promise<string[]> {
    if (!this.lsp26Context) {
      // Fallback işlemi
      try {
        const provider = (window as any).lukso || (window as any).ethereum;
        if (provider) {
          const web3 = new Web3(provider as any);
          const contract = new web3.eth.Contract(LSP26_ABI as any, LSP26_CONTRACT_ADDRESS);
          
          const followingCount = await contract.methods.followingCount(address).call();
          if (Number(followingCount) === 0) return [];
          
          const endIndex = Math.min(startIndex + PAGE_SIZE, Number(followingCount));
          const data = await contract.methods.getFollowsByIndex(address, startIndex, endIndex).call();
          return Array.isArray(data) ? data : [];
        }
        return [];
      } catch (error) {
        console.error('Error getting following (fallback):', error);
        return [];
      }
    }
    
    return this.lsp26Context.getFollowing(address, startIndex);
  }
  
  // Get all followers in a single call
  async getAllFollowers(address: string): Promise<string[]> {
    if (!this.lsp26Context) {
      // Fallback işlemi
      try {
        const provider = (window as any).lukso || (window as any).ethereum;
        if (provider) {
          const web3 = new Web3(provider as any);
          const contract = new web3.eth.Contract(LSP26_ABI as any, LSP26_CONTRACT_ADDRESS);
          
          const followerCount = await contract.methods.followerCount(address).call();
          if (Number(followerCount) === 0) return [];
          
          const data = await contract.methods.getFollowersByIndex(address, 0, followerCount).call();
          return Array.isArray(data) ? data : [];
        }
        return [];
      } catch (error) {
        console.error('Error getting all followers (fallback):', error);
        return [];
      }
    }
    
    return this.lsp26Context.getAllFollowers(address);
  }
  
  // Get all following in a single call
  async getAllFollowing(address: string): Promise<string[]> {
    if (!this.lsp26Context) {
      // Fallback işlemi
      try {
        const provider = (window as any).lukso || (window as any).ethereum;
        if (provider) {
          const web3 = new Web3(provider as any);
          const contract = new web3.eth.Contract(LSP26_ABI as any, LSP26_CONTRACT_ADDRESS);
          
          const followingCount = await contract.methods.followingCount(address).call();
          if (Number(followingCount) === 0) return [];
          
          const data = await contract.methods.getFollowsByIndex(address, 0, followingCount).call();
          return Array.isArray(data) ? data : [];
        }
        return [];
      } catch (error) {
        console.error('Error getting all following (fallback):', error);
        return [];
      }
    }
    
    return this.lsp26Context.getAllFollowing(address);
  }
  
  // Check if one address follows another
  async isFollowing(followerAddress: string, targetAddress: string): Promise<boolean> {
    if (!this.lsp26Context) {
      // Fallback işlemi
      try {
        const provider = (window as any).lukso || (window as any).ethereum;
        if (provider) {
          const web3 = new Web3(provider as any);
          const contract = new web3.eth.Contract(LSP26_ABI as any, LSP26_CONTRACT_ADDRESS);
          
          const data = await contract.methods.isFollowing(followerAddress, targetAddress).call();
          return Boolean(data);
        }
        return false;
      } catch (error) {
        console.error('Error checking following (fallback):', error);
        return false;
      }
    }
    
    return this.lsp26Context.isFollowing(followerAddress, targetAddress);
  }
  
  // Follow a profile
  async follow(targetAddress: string): Promise<boolean> {
    if (!this.lsp26Context) {
      // Fallback işlemi
      throw new Error('LSP26Context not initialized. Cannot perform follow action. Use LSP26Provider in your app.');
    }
    
    return this.lsp26Context.follow(targetAddress);
  }
  
  // Unfollow a profile
  async unfollow(targetAddress: string): Promise<boolean> {
    if (!this.lsp26Context) {
      // Fallback işlemi
      throw new Error('LSP26Context not initialized. Cannot perform unfollow action. Use LSP26Provider in your app.');
    }
    
    return this.lsp26Context.unfollow(targetAddress);
  }
}

// LSP26 context sağlayıcısı - Provider bileşeni olarak kullanılabilir
export type LSP26ProviderProps = {
  children: ReactNode
};

export const LSP26Provider = ({ children }: LSP26ProviderProps) => {
  const lsp26Context = useLSP26();
  
  // Global olarak context'i ataayalım, böylece LSP26FollowerSystem sınıfı
  // constructor içinde bu değere erişebilecek
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any)._LSP26Context = lsp26Context;
    }
  }, [lsp26Context]);
  
  return (
    <LSP26ContextObj.Provider value={lsp26Context}>
      {children}
    </LSP26ContextObj.Provider>
  );
};

// Context ile LSP26 kullanmak için consumer hook
export const useLSP26Context = () => {
  const context = useContext(LSP26ContextObj);
  if (!context) {
    throw new Error('useLSP26Context must be used within LSP26Provider');
  }
  return context;
}; 