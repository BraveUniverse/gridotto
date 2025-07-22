'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useEthersProvider } from './useEthersProvider';
import { adminAbi } from '@/abi';

const DIAMOND_ADDRESS = "0x5Ad808FAE645BA3682170467114e5b80A70bF276";

export interface SystemStats {
  totalDrawsCreated: bigint;
  totalTicketsSold: bigint;
  totalPrizesDistributed: bigint;
  totalExecutions: bigint;
}

export function useGridottoAdmin() {
  const { signer, provider, isConnected } = useEthersProvider();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (signer) {
      const adminContract = new ethers.Contract(
        DIAMOND_ADDRESS,
        adminAbi,
        signer
      );
      setContract(adminContract);
    } else if (provider) {
      // Read-only contract for non-connected users
      const adminContract = new ethers.Contract(
        DIAMOND_ADDRESS,
        adminAbi,
        provider
      );
      setContract(adminContract);
    }
  }, [signer, provider]);

  // Pause system
  const pauseSystem = async () => {
    if (!contract || !signer) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.pauseSystem();
      await tx.wait();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Unpause system
  const unpauseSystem = async () => {
    if (!contract || !signer) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.unpauseSystem();
      await tx.wait();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Withdraw platform fees
  const withdrawPlatformFees = async () => {
    if (!contract || !signer) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.withdrawPlatformFees();
      await tx.wait();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Set fee percentages
  const setFeePercentages = async (
    defaultPlatformFee: number,
    executorFeePercent: number,
    monthlyPoolPercent: number,
    weeklyMonthlyPercent: number
  ) => {
    if (!contract || !signer) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.setFeePercentages(
        defaultPlatformFee,
        executorFeePercent,
        monthlyPoolPercent,
        weeklyMonthlyPercent
      );
      await tx.wait();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get system stats
  const getSystemStats = async (): Promise<SystemStats | null> => {
    if (!contract) return null;
    
    try {
      const stats = await contract.getSystemStats();
      return {
        totalDrawsCreated: stats.totalDrawsCreated || stats[0],
        totalTicketsSold: stats.totalTicketsSold || stats[1],
        totalPrizesDistributed: stats.totalPrizesDistributed || stats[2],
        totalExecutions: stats.totalExecutions || stats[3]
      };
    } catch (err: any) {
      console.error('Error fetching system stats:', err);
      return null;
    }
  };

  // Check if user is admin
  const checkIsAdmin = async (address: string): Promise<boolean> => {
    if (!contract) return false;
    
    try {
      // For now, we'll use a hardcoded admin address
      // In production, this should check the actual admin role
      const ADMIN_ADDRESS = '0xYourAdminAddress'; // Replace with actual admin
      return address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
    } catch (err: any) {
      console.error('Error checking admin status:', err);
      return false;
    }
  };

  return {
    contract,
    loading,
    error,
    isConnected,
    pauseSystem,
    unpauseSystem,
    withdrawPlatformFees,
    setFeePercentages,
    getSystemStats,
    checkIsAdmin
  };
}