'use client';

import { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import { useUPProvider } from './useUPProvider';
import { diamondAbi } from '@/abi';
import { sendTransaction } from '@/utils/luksoTransactionHelper';
import { CONTRACTS } from '@/config/contracts';

const DIAMOND_ADDRESS = CONTRACTS.LUKSO_TESTNET.DIAMOND;

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
  const { web3, account, isConnected } = useUPProvider();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (web3) {
      const leaderboardContract = new web3.eth.Contract(
        diamondAbi as any,
        DIAMOND_ADDRESS
      );
      setContract(leaderboardContract);
    }
  }, [web3]);

  // Get top winners by total winnings
  const getTopWinners = async (limit: number = 10): Promise<TopWinner[]> => {
    if (!contract) return [];
    
    try {
      const winners = await contract.methods.getTopWinners(limit).call();
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
      const buyers = await contract.methods.getTopTicketBuyers(limit).call();
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
      const creators = await contract.methods.getTopDrawCreators(limit).call();
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
      const executors = await contract.methods.getTopExecutors(limit).call();
      return executors;
    } catch (err: any) {
      console.error('Error fetching top executors:', err);
      return [];
    }
  };

  // Get overall platform statistics
  const getPlatformStats = useCallback(async (): Promise<PlatformStats | null> => {
    if (!contract) return null;
    
    try {
      const stats = await contract.methods.getPlatformStats().call();
      
      return {
        totalPrizesDistributed: BigInt(stats.totalPrizesDistributed),
        totalTicketsSold: BigInt(stats.totalTicketsSold),
        totalDrawsCreated: BigInt(stats.totalDrawsCreated),
        totalExecutions: BigInt(stats.totalExecutions)
      };
    } catch (error) {
      console.error('[useGridottoLeaderboard] Error fetching platform stats:', error);
      return null;
    }
  }, [contract]);

  return {
    getTopWinners,
    getTopTicketBuyers,
    getTopDrawCreators,
    getTopExecutors,
    getPlatformStats,
    loading: !contract
  };
};