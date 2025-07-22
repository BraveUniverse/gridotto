'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUPProvider } from './useUPProvider';
import { CONTRACTS } from '@/config/contracts';
import { combinedAbi } from '@/abi';
import Web3 from 'web3';

interface TopWinner {
  rank: number;
  address: string;
  totalWins: string;
  totalWinnings: string;
  lastWinTime: Date;
}

interface TopTicketBuyer {
  rank: number;
  address: string;
  totalTickets: string;
  totalSpent: string;
  lastPurchaseTime: Date;
}

interface TopDrawCreator {
  rank: number;
  address: string;
  drawsCreated: string;
  totalRevenue: string;
  successfulDraws: string;
  successRate: string;
}

interface TopExecutor {
  rank: number;
  address: string;
  executionCount: string;
  totalFeesEarned: string;
}

interface PlatformStats {
  totalPrizesDistributed: string;
  totalTicketsSold: string;
  totalDrawsCreated: string;
  totalExecutions: string;
}

export const useGridottoLeaderboard = () => {
  const { web3, account } = useUPProvider();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initContract = async () => {
      if (!web3) return;

      try {
        setLoading(true);
        
        const contractInstance = new web3.eth.Contract(
          combinedAbi as any,
          CONTRACTS.LUKSO_TESTNET.DIAMOND
        );
        
        setContract(contractInstance);
        setError(null);
      } catch (err) {
        console.error('Error initializing leaderboard contract:', err);
        setError('Failed to initialize contract');
      } finally {
        setLoading(false);
      }
    };

    initContract();
  }, [web3]);

  // Get top winners
  const getTopWinners = useCallback(async (limit: number = 10): Promise<TopWinner[]> => {
    if (!contract) return [];
    
    try {
      const winners = await contract.methods.getTopWinners(limit).call();
      
      // ⚠️ IMPORTANT: Data is already sorted by totalWinnings (descending)
      // Just map and display, DO NOT sort again!
      return winners.map((winner: any, index: number) => ({
        rank: index + 1,
        address: winner.player,
        totalWins: winner.totalWins.toString(),
        totalWinnings: Web3.utils.fromWei(winner.totalWinnings, 'ether'),
        lastWinTime: new Date(Number(winner.lastWinTime) * 1000)
      }));
    } catch (err) {
      console.error('Error fetching top winners:', err);
      return [];
    }
  }, [contract]);

  // Get top ticket buyers
  const getTopTicketBuyers = useCallback(async (limit: number = 10): Promise<TopTicketBuyer[]> => {
    if (!contract) return [];
    
    try {
      const buyers = await contract.methods.getTopTicketBuyers(limit).call();
      
      // ⚠️ IMPORTANT: Data is already sorted by totalSpent (descending)
      return buyers.map((buyer: any, index: number) => ({
        rank: index + 1,
        address: buyer.player,
        totalTickets: buyer.totalTickets.toString(),
        totalSpent: Web3.utils.fromWei(buyer.totalSpent, 'ether'),
        lastPurchaseTime: new Date(Number(buyer.lastPurchaseTime) * 1000)
      }));
    } catch (err) {
      console.error('Error fetching top ticket buyers:', err);
      return [];
    }
  }, [contract]);

  // Get top draw creators
  const getTopDrawCreators = useCallback(async (limit: number = 10): Promise<TopDrawCreator[]> => {
    if (!contract) return [];
    
    try {
      const creators = await contract.methods.getTopDrawCreators(limit).call();
      
      // ⚠️ IMPORTANT: Data is already sorted by totalRevenue (descending)
      return creators.map((creator: any, index: number) => ({
        rank: index + 1,
        address: creator.creator,
        drawsCreated: creator.drawsCreated.toString(),
        totalRevenue: Web3.utils.fromWei(creator.totalRevenue, 'ether'),
        successfulDraws: creator.successfulDraws.toString(),
        successRate: creator.successRate.toString() + '%'
      }));
    } catch (err) {
      console.error('Error fetching top draw creators:', err);
      return [];
    }
  }, [contract]);

  // Get top executors
  const getTopExecutors = useCallback(async (limit: number = 10): Promise<TopExecutor[]> => {
    if (!contract) return [];
    
    try {
      const executors = await contract.methods.getTopExecutors(limit).call();
      
      // ⚠️ IMPORTANT: Data is already sorted by totalFeesEarned (descending)
      return executors.map((executor: any, index: number) => ({
        rank: index + 1,
        address: executor.executor,
        executionCount: executor.executionCount.toString(),
        totalFeesEarned: Web3.utils.fromWei(executor.totalFeesEarned, 'ether')
      }));
    } catch (err) {
      console.error('Error fetching top executors:', err);
      return [];
    }
  }, [contract]);

  // Get platform statistics
  const getPlatformStats = useCallback(async (): Promise<PlatformStats | null> => {
    if (!contract) return null;
    
    try {
      const stats = await contract.methods.getPlatformStats().call();
      
      return {
        totalPrizesDistributed: Web3.utils.fromWei(stats.totalPrizesDistributed, 'ether'),
        totalTicketsSold: stats.totalTicketsSold.toString(),
        totalDrawsCreated: stats.totalDrawsCreated.toString(),
        totalExecutions: stats.totalExecutions.toString()
      };
    } catch (err) {
      console.error('Error fetching platform stats:', err);
      return null;
    }
  }, [contract]);

  return {
    contract,
    loading,
    error,
    getTopWinners,
    getTopTicketBuyers,
    getTopDrawCreators,
    getTopExecutors,
    getPlatformStats
  };
};