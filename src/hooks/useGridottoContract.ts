'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUPProvider } from './useUPProvider';
import { CONTRACTS } from '@/config/contracts';
import { gridottoAbi } from '@/abi/gridottoAbi';
import { phase3Abi } from '@/abi/phase3Abi';
import { phase4Abi } from '@/abi/phase4Abi';
import { adminAbi } from '@/abi/adminAbi';
import { uiHelperAbi } from '@/abi/uiHelperAbi';
import { batchAbi } from '@/abi/batchAbi';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { UserDraw, DrawInfo, ContractInfo, PlatformStats } from '@/types/gridotto';

// Combine all ABIs
const combinedAbi = [
  ...gridottoAbi,
  ...phase3Abi,
  ...phase4Abi,
  ...adminAbi,
  ...uiHelperAbi,
  ...batchAbi
] as AbiItem[];

export const useGridottoContract = () => {
  const { web3, account } = useUPProvider();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (web3) {
      try {
        const contractInstance = new web3.eth.Contract(
          combinedAbi,
          CONTRACTS.LUKSO_TESTNET.DIAMOND
        );
        setContract(contractInstance);
        setLoading(false);
      } catch (err) {
        console.error('Error creating contract instance:', err);
        setError('Failed to create contract instance');
        setLoading(false);
      }
    }
  }, [web3]);

  // Get active user draws using UI helper
  const getActiveUserDraws = useCallback(async (): Promise<UserDraw[]> => {
    if (!contract) return [];
    
    try {
      const activeDraws = await contract.methods.getActiveUserDraws(20).call();
      
      return activeDraws.map((draw: any) => ({
        drawId: draw.drawId,
        creator: draw.creator,
        endTime: draw.endTime,
        prizeType: 'LYX', // Default, will be updated with getUserDrawStats
        prizeAmount: '0',
        ticketPrice: '0',
        maxTickets: 0,
        minTickets: 0,
        isActive: true,
        totalTicketsSold: 0,
        participants: []
      }));
    } catch (err) {
      console.error('Error fetching active draws:', err);
      return [];
    }
  }, [contract]);

  // Get user created draws
  const getUserCreatedDraws = useCallback(async (creator: string, offset = 0, limit = 10): Promise<number[]> => {
    if (!contract) return [];
    
    try {
      const drawIds = await contract.methods.getUserCreatedDraws(creator, offset, limit).call();
      return drawIds;
    } catch (err) {
      console.error('Error fetching user created draws:', err);
      return [];
    }
  }, [contract]);

  // Get draw statistics
  const getUserDrawStats = useCallback(async (drawId: number): Promise<DrawInfo | null> => {
    if (!contract) return null;
    
    try {
      const stats = await contract.methods.getUserDrawStats(drawId).call();
      
      return {
        creator: stats.creator,
        endTime: stats.endTime,
        prizePool: stats.prizePool,
        totalParticipants: stats.totalParticipants,
        totalTicketsSold: stats.totalTicketsSold
      };
    } catch (err) {
      console.error('Error fetching draw stats:', err);
      return null;
    }
  }, [contract]);

  // Get all claimable prizes
  const getAllClaimablePrizes = useCallback(async (user: string) => {
    if (!contract) return { totalLYX: '0', hasTokenPrizes: false, hasNFTPrizes: false };
    
    try {
      const result = await contract.methods.getAllClaimablePrizes(user).call();
      return {
        totalLYX: result.totalLYX,
        hasTokenPrizes: result.hasTokenPrizes,
        hasNFTPrizes: result.hasNFTPrizes
      };
    } catch (err) {
      console.error('Error fetching claimable prizes:', err);
      return { totalLYX: '0', hasTokenPrizes: false, hasNFTPrizes: false };
    }
  }, [contract]);

  // Get official draw info
  const getOfficialDrawInfo = useCallback(async () => {
    if (!contract) return null;
    
    try {
      const info = await contract.methods.getOfficialDrawInfo().call();
      return {
        currentDrawNumber: info.currentDrawNumber,
        nextDrawTime: info.nextDrawTime,
        ticketPrice: info.ticketPrice
      };
    } catch (err) {
      console.error('Error fetching official draw info:', err);
      return null;
    }
  }, [contract]);

  // Claim all prizes
  const claimAll = useCallback(async () => {
    if (!contract || !account) throw new Error('Contract or account not available');
    
    try {
      const tx = await contract.methods.claimAll().send({ from: account });
      return tx;
    } catch (err) {
      console.error('Error claiming all prizes:', err);
      throw err;
    }
  }, [contract, account]);

  // Get contract info
  const getContractInfo = useCallback(async (): Promise<ContractInfo | null> => {
    if (!contract || !web3) return null;
    
    try {
      const [balance, officialInfo] = await Promise.all([
        web3.eth.getBalance(CONTRACTS.LUKSO_TESTNET.DIAMOND),
        getOfficialDrawInfo()
      ]);
      
      return {
        totalPrizePool: balance.toString(),
        currentDrawNumber: officialInfo?.currentDrawNumber || 0,
        nextDrawTime: officialInfo?.nextDrawTime || 0,
        ticketPrice: officialInfo?.ticketPrice || '1000000000000000000' // 1 LYX default
      };
    } catch (err) {
      console.error('Error fetching contract info:', err);
      return null;
    }
  }, [contract, web3, getOfficialDrawInfo]);

  // Get platform statistics
  const getPlatformStats = useCallback(async (): Promise<PlatformStats | null> => {
    if (!contract) return null;
    
    try {
      // Get active draws for stats
      const activeDraws = await getActiveUserDraws();
      
      return {
        totalDraws: activeDraws.length,
        activeDraws: activeDraws.length,
        totalPrizePool: '0', // Will be calculated from individual draws
        totalParticipants: 0, // Will be calculated from individual draws
        averageTicketPrice: '1000000000000000000' // 1 LYX default
      };
    } catch (err) {
      console.error('Error fetching platform stats:', err);
      return null;
    }
  }, [contract, getActiveUserDraws]);

  // Legacy functions for compatibility
  const getUserDraws = useCallback(async (userAddress: string): Promise<UserDraw[]> => {
    if (!contract) return [];
    
    try {
      const drawIds = await getUserCreatedDraws(userAddress, 0, 100);
      const draws: UserDraw[] = [];
      
      for (const drawId of drawIds) {
        const stats = await getUserDrawStats(Number(drawId));
        if (stats) {
          draws.push({
            drawId: Number(drawId),
            creator: stats.creator,
            endTime: stats.endTime,
            prizeType: 'LYX',
            prizeAmount: stats.prizePool,
            ticketPrice: '1000000000000000000', // 1 LYX default
            maxTickets: 100,
            minTickets: 1,
            isActive: Number(stats.endTime) > Date.now() / 1000,
            totalTicketsSold: Number(stats.totalTicketsSold),
            participants: []
          });
        }
      }
      
      return draws;
    } catch (err) {
      console.error('Error fetching user draws:', err);
      return [];
    }
  }, [contract, getUserCreatedDraws, getUserDrawStats]);

  // Get full draw details
  const getUserDraw = useCallback(async (drawId: number) => {
    if (!contract) return null;
    
    try {
      const draw = await contract.methods.getUserDraw(drawId).call();
      return {
        creator: draw.creator,
        drawType: draw.drawType,
        startTime: draw.startTime,
        endTime: draw.endTime,
        ticketPrice: draw.ticketPrice,
        maxTickets: draw.maxTickets,
        ticketsSold: draw.ticketsSold,
        currentPrizePool: draw.currentPrizePool,
        isCompleted: draw.isCompleted,
        isExecuted: draw.isExecuted,
        requirement: draw.requirement,
        requiredToken: draw.requiredToken,
        minTokenAmount: draw.minTokenAmount
      };
    } catch (err) {
      console.error('Error fetching user draw:', err);
      return null;
    }
  }, [contract]);

  const getDrawInfo = useCallback(async (drawId: number): Promise<UserDraw | null> => {
    if (!contract) return null;
    
    try {
      const [draw, stats] = await Promise.all([
        getUserDraw(drawId),
        getUserDrawStats(drawId)
      ]);
      
      if (!draw || !stats) return null;
      
      // Map drawType to prizeType
      const prizeTypeMap: Record<number, 'LYX' | 'LSP7' | 'LSP8'> = {
        2: 'LYX',    // USER_LYX
        3: 'LSP7',   // USER_LSP7
        4: 'LSP8'    // USER_LSP8
      };
      
      return {
        drawId,
        creator: draw.creator,
        endTime: draw.endTime,
        prizeType: prizeTypeMap[draw.drawType] || 'LYX',
        prizeAmount: draw.currentPrizePool,
        ticketPrice: draw.ticketPrice,
        maxTickets: Number(draw.maxTickets),
        minTickets: 1,
        isActive: !draw.isCompleted && Number(draw.endTime) > Date.now() / 1000,
        totalTicketsSold: Number(draw.ticketsSold),
        participants: []
      };
    } catch (err) {
      console.error('Error fetching draw info:', err);
      return null;
    }
  }, [contract, getUserDraw, getUserDrawStats]);

  const purchaseTickets = useCallback(async (drawId: number, ticketCount: number, ticketPrice: string) => {
    if (!contract || !account) throw new Error('Contract or account not available');
    
    try {
      const totalPrice = (BigInt(ticketPrice) * BigInt(ticketCount)).toString();
      const tx = await contract.methods.purchaseTickets(drawId, ticketCount).send({ 
        from: account,
        value: totalPrice 
      });
      return tx;
    } catch (err) {
      console.error('Error purchasing tickets:', err);
      throw err;
    }
  }, [contract, account]);

  const createDraw = useCallback(async (params: {
    drawType: 'LYX' | 'TOKEN' | 'NFT';
    ticketPrice: string;
    duration: number;
    maxTickets: number;
    initialPrize?: string;
    tokenAddress?: string;
    nftContract?: string;
    nftTokenIds?: string[];
    requirement?: number;
    requiredToken?: string;
    minTokenAmount?: string;
    prizeModel?: number;
    totalWinners?: number;
  }) => {
    if (!contract || !account) throw new Error('Contract or account not available');
    
    try {
      // Map drawType to contract enum
      const drawTypeMap = {
        'LYX': 2,    // USER_LYX
        'TOKEN': 3,  // USER_LSP7
        'NFT': 4     // USER_LSP8
      };
      
      // Default prize config
      const prizeConfig = {
        model: params.prizeModel || 0, // CREATOR_FUNDED
        creatorContribution: params.initialPrize || '0',
        addParticipationFees: true,
        participationFeePercent: 0,
        totalWinners: params.totalWinners || 1
      };
      
      // LSP26 config (disabled by default)
      const lsp26Config = {
        enabled: false,
        followersRequired: 0
      };
      
      // Convert string tokenIds to bytes32
      const nftTokenIds = params.nftTokenIds?.map(id => 
        Web3.utils.padLeft(Web3.utils.toHex(id), 64)
      ) || [];
      
      // Prepare config object
      const config = {
        ticketPrice: params.ticketPrice,
        duration: params.duration,
        maxTickets: params.maxTickets,
        initialPrize: params.initialPrize || '0',
        requirement: params.requirement || 0,
        requiredToken: params.requiredToken || '0x0000000000000000000000000000000000000000',
        minTokenAmount: params.minTokenAmount || '0',
        prizeConfig,
        lsp26Config,
        tokenAddress: params.tokenAddress || '0x0000000000000000000000000000000000000000',
        nftContract: params.nftContract || '0x0000000000000000000000000000000000000000',
        nftTokenIds,
        tiers: [] // Empty tiers for now
      };
      
      const value = params.drawType === 'LYX' && params.initialPrize 
        ? params.initialPrize 
        : '0';
      
      const tx = await contract.methods.createAdvancedDraw(
        drawTypeMap[params.drawType],
        config
      ).send({ 
        from: account,
        value 
      });
      
      return tx;
    } catch (err) {
      console.error('Error creating draw:', err);
      throw err;
    }
  }, [contract, account]);

  return {
    contract,
    loading,
    error,
    // UI Helper functions
    getActiveUserDraws,
    getUserCreatedDraws,
    getUserDrawStats,
    getUserDraw,
    getAllClaimablePrizes,
    getOfficialDrawInfo,
    claimAll,
    // Legacy functions
    getUserDraws,
    getDrawInfo,
    getContractInfo,
    getPlatformStats,
    purchaseTickets,
    createDraw
  };
}; 