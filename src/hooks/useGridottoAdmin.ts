'use client';

import { useState, useEffect } from 'react';
import { useUPProvider } from './useUPProvider';
import { adminAbi } from '@/abi';
import Web3 from 'web3';
import { CONTRACTS } from '@/config/contracts';

const DIAMOND_ADDRESS = CONTRACTS.LUKSO_TESTNET.DIAMOND;

export interface SystemStats {
  totalDrawsCreated: bigint;
  totalTicketsSold: bigint;
  totalPrizesDistributed: bigint;
  totalExecutions: bigint;
}

export function useGridottoAdmin() {
  const { web3, account, isConnected } = useUPProvider();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (web3) {
      const adminContract = new web3.eth.Contract(adminAbi as any, DIAMOND_ADDRESS);
      setContract(adminContract);
    }
  }, [web3]);

  // Pause system
  const pauseSystem = async () => {
    if (!contract || !account) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.methods.pauseSystem().send({ from: account });
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Unpause system
  const unpauseSystem = async () => {
    if (!contract || !account) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.methods.unpauseSystem().send({ from: account });
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Withdraw platform fees
  const withdrawPlatformFees = async () => {
    if (!contract || !account) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.methods.withdrawPlatformFees().send({ from: account });
      return tx;
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
    if (!contract || !account) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.methods.setFeePercentages(
        defaultPlatformFee,
        executorFeePercent,
        monthlyPoolPercent,
        weeklyMonthlyPercent
      ).send({ from: account });
      return tx;
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
      const stats = await contract.methods.getSystemStats().call();
      return {
        totalDrawsCreated: BigInt(stats.totalDrawsCreated || stats[0]),
        totalTicketsSold: BigInt(stats.totalTicketsSold || stats[1]),
        totalPrizesDistributed: BigInt(stats.totalPrizesDistributed || stats[2]),
        totalExecutions: BigInt(stats.totalExecutions || stats[3])
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