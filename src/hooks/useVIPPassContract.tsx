import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import Web3 from 'web3';
import { useUPProvider } from './useUPProvider';
import { VIPPASS_CONTRACT_ABI, VIPPASS_CONTRACT_ADDRESS } from '@/config/vippass';

// VIP Pass tier enums
export enum VIPPassTier {
  NO_TIER = 0,
  SILVER = 1,
  GOLD = 2,
  DIAMOND = 3,
  UNIVERSE = 4
}

export function useVIPPassContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { provider, web3, account } = useUPProvider();

  // Get contract instances
  const getReadContract = useCallback(() => {
    if (!provider || !web3) return null;
    try {
      // Use web3 provider for ethers
      const ethersProvider = new ethers.providers.Web3Provider(web3.currentProvider as any);
      return new ethers.Contract(VIPPASS_CONTRACT_ADDRESS, VIPPASS_CONTRACT_ABI, ethersProvider);
    } catch (err) {
      console.error("Failed to create read contract:", err);
      return null;
    }
  }, [provider, web3]);

  const getWriteContract = useCallback(() => {
    if (!provider || !web3 || !account) return null;
    try {
      // Use web3 provider for ethers with signer
      const ethersProvider = new ethers.providers.Web3Provider(web3.currentProvider as any);
      const signer = ethersProvider.getSigner();
      return new ethers.Contract(VIPPASS_CONTRACT_ADDRESS, VIPPASS_CONTRACT_ABI, signer);
    } catch (err) {
      console.error("Failed to create write contract:", err);
      return null;
    }
  }, [provider, web3, account]);

  // Get highest tier owned by an address
  const getHighestTierOwned = useCallback(async (address: string): Promise<VIPPassTier> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const contract = getReadContract();
      if (!contract) {
        throw new Error('Contract connection not available');
      }
      
      const result = await contract.getHighestTierOwned(address);
      // Ethers.js BigNumber veya hex string olarak dönebilir, sayıya çevirelim
      const tier = typeof result === 'object' && result.toNumber ? 
        result.toNumber() : 
        parseInt(result.toString());
      return tier as VIPPassTier;
    } catch (err: any) {
      
      // Hata mesajında geçerli bir sonuç var mı kontrol edelim
      try {
        if (err && err.error && err.error.value && err.error.value.result) {
          // Hex string'i alıp sayıya çevirelim (0x00...04 -> 4)
          const hexResult = err.error.value.result;
          if (typeof hexResult === 'string' && hexResult.startsWith('0x')) {
            const tier = parseInt(hexResult, 16);
            return tier as VIPPassTier;
          }
        }
      } catch (extractError) {
        // Sessizce geç
      }
      
      setError(err.message || 'Error fetching VIP Pass tier');
      return VIPPassTier.NO_TIER;
    } finally {
      setIsLoading(false);
    }
  }, [getReadContract]);

  // Get tier name from tier number
  const getTierName = useCallback((tier: VIPPassTier): string => {
    switch (tier) {
      case VIPPassTier.SILVER:
        return 'Silver';
      case VIPPassTier.GOLD:
        return 'Gold';
      case VIPPassTier.DIAMOND:
        return 'Diamond';
      case VIPPassTier.UNIVERSE:
        return 'Universe';
      default:
        return 'No VIP';
    }
  }, []);

  // Check if an address owns a VIP Pass of minimum tier
  const hasMinimumTier = useCallback(async (address: string, minTier: VIPPassTier): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const contract = getReadContract();
      if (!contract) {
        throw new Error('Contract connection not available');
      }
      
      return await contract.hasMinimumTier(address, minTier);
    } catch (err: any) {
      
      // Hata mesajında geçerli bir sonuç var mı kontrol edelim
      try {
        if (err && err.error && err.error.value && err.error.value.result) {
          // Hex string'i alıp değere çevirelim
          const hexResult = err.error.value.result;
          if (typeof hexResult === 'string' && hexResult.startsWith('0x')) {
            const result = parseInt(hexResult, 16) === 1; // 0x1 = true, 0x0 = false
            return result;
          }
        }
      } catch (extractError) {
        // Sessizce geç
      }
      
      setError(err.message || 'Error checking VIP Pass tier');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getReadContract]);

  // Get all tier counts for an address
  const getAllTierCounts = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const contract = getReadContract();
      if (!contract) {
        throw new Error('Contract connection not available');
      }
      
      const counts = await contract.getAllTierCounts(address);
      return {
        silver: counts.silverCount.toNumber(),
        gold: counts.goldCount.toNumber(),
        diamond: counts.diamondCount.toNumber(),
        universe: counts.universeCount.toNumber()
      };
    } catch (err: any) {
      
      // Hata mesajında geçerli bir sonuç var mı kontrol edelim - ancak
      // bu fonksiyon daha karmaşık bir nesne döndüğünden, bu durum daha zor.
      // İleride burası için bir çözüm geliştirebiliriz.
      
      setError(err.message || 'Error fetching VIP Pass counts');
      return { silver: 0, gold: 0, diamond: 0, universe: 0 };
    } finally {
      setIsLoading(false);
    }
  }, [getReadContract]);

  return {
    getHighestTierOwned,
    getTierName,
    hasMinimumTier,
    getAllTierCounts,
    isLoading,
    error
  };
} 