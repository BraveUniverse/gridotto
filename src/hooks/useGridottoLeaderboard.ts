'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useEthersProvider } from './useEthersProvider';
import { leaderboardAbi } from '@/abi';

const DIAMOND_ADDRESS = "0x5Ad808FAE645BA3682170467114e5b80A70bF276";

export interface TopWinner {
  player: string;
  totalWins: bigint;
  totalWinnings: bigint;
  lastWinTime: bigint;
}

export interface TopBuyer {
  player: string;
  totalTickets: bigint;
  totalSpent: bigint;
  lastPurchaseTime: bigint;
}

export interface TopCreator {
  creator: string;
  drawsCreated: bigint;
  totalRevenue: bigint;
  successfulDraws: bigint;
}

export interface TopExecutor {
  executor: string;
  executionCount: bigint;
  totalFeesEarned: bigint;
}

export interface PlatformStats {
  totalPrizesDistributed: bigint;
  totalTicketsSold: bigint;
  totalDrawsCreated: bigint;
  totalExecutions: bigint;
}

export function useGridottoLeaderboard() {
  const { signer, provider } = useEthersProvider();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (signer) {
      const leaderboardContract = new ethers.Contract(
        DIAMOND_ADDRESS,
        leaderboardAbi,
        signer
      );
      setContract(leaderboardContract);
    } else if (provider) {
      // Read-only contract for non-connected users
      const leaderboardContract = new ethers.Contract(
        DIAMOND_ADDRESS,
        leaderboardAbi,
        provider
      );
      setContract(leaderboardContract);
    }
  }, [signer, provider]);

  // Get top winners by total winnings
  const getTopWinners = async (limit: number = 10): Promise<TopWinner[]> => {
    if (!contract) return [];
    
    try {
      const winners = await contract.getTopWinners(limit);
      return winners;
    } catch (err: any) {
      console.error('Error fetching top winners:', err);
      return [];
    }
  };

  // Get most active ticket buyers
  const getTopTicketBuyers = async (limit: number = 10): Promise<TopBuyer[]> => {
    if (!contract) return [];
    
    try {
      const buyers = await contract.getTopTicketBuyers(limit);
      return buyers;
    } catch (err: any) {
      console.error('Error fetching top ticket buyers:', err);
      return [];
    }
  };

  // Get most successful draw creators
  const getTopDrawCreators = async (limit: number = 10): Promise<TopCreator[]> => {
    if (!contract) return [];
    
    try {
      const creators = await contract.getTopDrawCreators(limit);
      return creators;
    } catch (err: any) {
      console.error('Error fetching top draw creators:', err);
      return [];
    }
  };

  // Get top draw executors by count
  const getTopExecutors = async (limit: number = 10): Promise<TopExecutor[]> => {
    if (!contract) return [];
    
    try {
      const executors = await contract.getTopExecutors(limit);
      return executors;
    } catch (err: any) {
      console.error('Error fetching top executors:', err);
      return [];
    }
  };

  // Get overall platform statistics
  const getPlatformStatistics = async (): Promise<PlatformStats | null> => {
    if (!contract) return null;
    
    try {
      const stats = await contract.getPlatformStatistics();
      return stats;
    } catch (err: any) {
      console.error('Error fetching platform statistics:', err);
      return null;
    }
  };

  return {
    contract,
    loading,
    error,
    getTopWinners,
    getTopTicketBuyers,
    getTopDrawCreators,
    getTopExecutors,
    getPlatformStatistics
  };
}