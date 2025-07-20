'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUPProvider } from './useUPProvider';
import { CONTRACTS } from '@/config/contracts';
import { combinedAbi } from '@/abi';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { UserDraw, DrawInfo, ContractInfo, PlatformStats } from '@/types/gridotto';

export const useGridottoContract = () => {
  const { web3, account } = useUPProvider();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initContract = async () => {
      if (!web3 || !account) {
        console.log('Web3 or account not available:', { web3: !!web3, account });
        return;
      }

      try {
        setLoading(true);
        
        console.log('=== INITIALIZING CONTRACT ===');
        console.log('Contract Address:', CONTRACTS.LUKSO_TESTNET.DIAMOND);
        console.log('Account:', account);
        

        
        console.log('Combined ABI length:', combinedAbi.length);
        
        const contractInstance = new web3.eth.Contract(
          combinedAbi as any,
          CONTRACTS.LUKSO_TESTNET.DIAMOND
        );
        
        console.log('Contract instance created:', !!contractInstance);
        console.log('Available methods:', Object.keys(contractInstance.methods).length);
        
        // Log some key methods to verify they exist
        console.log('Key methods check:', {
          createAdvancedDraw: !!contractInstance.methods.createAdvancedDraw,
          purchaseTickets: !!contractInstance.methods.buyUserDrawTicket,
          executeUserDraw: !!contractInstance.methods.executeUserDraw,
          getAdvancedDrawInfo: !!contractInstance.methods.getAdvancedDrawInfo
        });
        
        setContract(contractInstance);
        setError(null);
      } catch (err) {
        console.error('Error initializing contract:', err);
        setError('Failed to initialize contract');
      } finally {
        setLoading(false);
      }
    };

    initContract();
  }, [web3, account]);

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
    
    console.log('=== CLAIM ALL PARAMS ===');
    console.log('Account:', account);
    
    try {
      const tx = await contract.methods.claimAll().send({ from: account });
      console.log('Claim all transaction successful:', tx);
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
    
    console.log('=== PURCHASE USER DRAW TICKETS ===');
    console.log('Draw ID:', drawId);
    console.log('Ticket Count:', ticketCount);
    console.log('Ticket Price (wei):', ticketPrice);
    console.log('Using function: buyUserDrawTicket');
    
    try {
      const totalCost = BigInt(ticketPrice) * BigInt(ticketCount);
      console.log('Total Cost (wei):', totalCost.toString());
      console.log('Total Cost (LYX):', Web3.utils.fromWei(totalCost.toString(), 'ether'));
      
      // Use buyUserDrawTicket instead of purchaseTickets
      const tx = await contract.methods.buyUserDrawTicket(drawId, ticketCount).send({ 
        from: account,
        value: totalCost.toString()
      });
      
      console.log('Buy user draw tickets transaction successful:', tx);
      return tx;
    } catch (err) {
      console.error('Error buying user draw tickets:', err);
      throw err;
    }
  }, [contract, account]);

  const createDraw = useCallback(async (params: {
    drawType: 'LYX' | 'TOKEN' | 'NFT';
    ticketPrice?: string;
    duration: number;
    maxTickets?: number;
    initialPrize?: string;
    tokenAddress?: string;
    nftContract?: string;
    nftTokenIds?: string[];
    requirement?: number;
    requiredToken?: string;
    minTokenAmount?: string;
    numberOfWinners?: number;
    creatorFeePercent?: number;
    minParticipants?: number;
    maxParticipants?: number;
    maxTicketsPerUser?: number;
  }) => {
    if (!contract || !account) throw new Error('Contract or account not available');
    
    console.log('=== CREATE DRAW PARAMS ===');
    console.log('Input params:', params);
    
    try {
      // Map drawType to contract enum
      const drawTypeMap = {
        'LYX': 2,    // USER_LYX
        'TOKEN': 3,  // USER_LSP7
        'NFT': 4     // USER_LSP8
      };
      
      const drawTypeEnum = drawTypeMap[params.drawType];
      
      // Convert string tokenIds to bytes32
      const nftTokenIds = params.nftTokenIds?.map(id => 
        Web3.utils.padLeft(Web3.utils.toHex(id), 64)
      ) || [];
      
      // Prepare config object according to contract structure
      const config = {
        ticketPrice: params.ticketPrice || '0',
        duration: params.duration,
        maxTickets: params.maxTickets || 0,
        initialPrize: params.initialPrize || '0',
        requirement: params.requirement || 0,
        requiredToken: params.requiredToken || '0x0000000000000000000000000000000000000000',
        minTokenAmount: params.minTokenAmount || '0',
        prizeConfig: {
          model: 0, // CREATOR_FUNDED for LYX draws
          creatorContribution: params.initialPrize || '0',
          addParticipationFees: true,
          participationFeePercent: params.creatorFeePercent || 0,
          totalWinners: params.numberOfWinners || 1
        },
        lsp26Config: {
          requireFollowing: false,
          profileToFollow: '0x0000000000000000000000000000000000000000',
          minFollowers: 0,
          requireMutualFollow: false
        },
        tokenAddress: params.tokenAddress || '0x0000000000000000000000000000000000000000',
        nftContract: params.nftContract || '0x0000000000000000000000000000000000000000',
        nftTokenIds: nftTokenIds,
        tiers: [] as Array<{prizePercentage: number, fixedPrize: number, nftTokenId: string}>
      };
      
      // Validation
      if (!config.maxTickets || config.maxTickets === 0) {
        throw new Error('Max tickets must be greater than 0');
      }
      
      if (!config.ticketPrice || config.ticketPrice === '0') {
        throw new Error('Ticket price must be greater than 0');
      }
      
      console.log('DrawType enum:', drawTypeEnum);
      console.log('Contract config object:', config);
      console.log('Sending from account:', account);
      
      // Send value if it's a LYX draw with initial prize
      const value = params.drawType === 'LYX' && params.initialPrize ? params.initialPrize : '0';
      console.log('Transaction value:', value);
      
      const tx = await contract.methods.createAdvancedDraw(
        drawTypeEnum,
        config
      ).send({ 
        from: account,
        value
      });
      
      console.log('Transaction successful:', tx);
      return tx;
    } catch (err) {
      console.error('Error creating draw:', err);
      throw err;
    }
  }, [contract, account]);

  // Get executor reward for a draw
  const getUserDrawExecutorReward = useCallback(async (drawId: number): Promise<string> => {
    if (!contract) return '0';
    
    try {
      const reward = await contract.methods.getUserDrawExecutorReward(drawId).call();
      return reward;
    } catch (err) {
      console.error('Error fetching executor reward:', err);
      return '0';
    }
  }, [contract]);

  // Get recent winners for leaderboard
  const getRecentWinners = useCallback(async (offset: number = 0, limit: number = 10) => {
    if (!contract) return [];
    
    try {
      const winners = await contract.methods.getRecentWinners(offset, limit).call();
      return winners;
    } catch (err) {
      console.error('Error fetching recent winners:', err);
      return [];
    }
  }, [contract]);

  // Get advanced draw info
  const getAdvancedDrawInfo = useCallback(async (drawId: number) => {
    if (!contract) return null;
    
    try {
      const info = await contract.methods.getAdvancedDrawInfo(drawId).call();
      return {
        creator: info[0],
        drawType: info[1],
        startTime: info[2],
        endTime: info[3],
        ticketPrice: info[4],
        totalTickets: info[5],
        participantCount: info[6],
        prizePool: info[7],
        tokenAddress: info[8],
        nftContract: info[9],
        nftCount: info[10],
        isCompleted: info[11],
        winners: info[12],
        minParticipants: info[13],
        maxParticipants: info[14],
        requirement: info[15],
        executorReward: info[16]
      };
    } catch (err) {
      console.error('Error fetching advanced draw info:', err);
      return null;
    }
  }, [contract]);

  // Check if user can participate
  const canUserParticipate = useCallback(async (drawId: number, user: string) => {
    if (!contract) return { canParticipate: false, reason: 'Contract not loaded' };
    
    try {
      const result = await contract.methods.canUserParticipate(drawId, user).call();
      return {
        canParticipate: result[0],
        reason: result[1]
      };
    } catch (err) {
      console.error('Error checking participation:', err);
      return { canParticipate: false, reason: 'Error checking eligibility' };
    }
  }, [contract]);

  // Execute user draw
  const executeUserDraw = useCallback(async (drawId: number) => {
    if (!contract || !account) throw new Error('Contract or account not available');
    
    console.log('=== EXECUTE USER DRAW PARAMS ===');
    console.log('Draw ID:', drawId);
    console.log('Account:', account);
    
    try {
      const tx = await contract.methods.executeUserDraw(drawId).send({ from: account });
      console.log('Execute draw transaction successful:', tx);
      return tx;
    } catch (err) {
      console.error('Error executing draw:', err);
      throw err;
    }
  }, [contract, account]);

  // Buy tickets for official weekly draw
  const buyTickets = useCallback(async (amount: number) => {
    if (!contract || !account) throw new Error('Contract or account not available');
    
    console.log('=== BUY OFFICIAL TICKETS ===');
    console.log('Amount:', amount);
    console.log('Account:', account);
    
    try {
      const ticketPrice = await contract.methods.getTicketPrice().call();
      const totalCost = BigInt(ticketPrice) * BigInt(amount);
      
      console.log('Ticket price:', ticketPrice);
      console.log('Total cost:', totalCost.toString());
      
      // Use buyMultipleTickets for multiple tickets, buyTicket for single
      if (amount === 1) {
        const tx = await contract.methods.buyTicket(account).send({
          from: account,
          value: totalCost.toString()
        });
        console.log('Buy ticket transaction successful:', tx);
        return tx;
      } else {
        const tx = await contract.methods.buyMultipleTickets(account, amount).send({
          from: account,
          value: totalCost.toString()
        });
        console.log('Buy multiple tickets transaction successful:', tx);
        return tx;
      }
    } catch (err) {
      console.error('Error buying tickets:', err);
      throw err;
    }
  }, [contract, account]);

  // Buy tickets for monthly draw (same as weekly, just different tracking)
  const buyMonthlyTickets = useCallback(async (amount: number) => {
    if (!contract || !account) throw new Error('Contract or account not available');
    
    console.log('=== BUY MONTHLY TICKETS ===');
    console.log('Amount:', amount);
    console.log('Account:', account);
    console.log('Note: Monthly tickets use the same function as weekly tickets');
    
    try {
      const ticketPrice = await contract.methods.getTicketPrice().call();
      const totalCost = BigInt(ticketPrice) * BigInt(amount);
      
      console.log('Ticket price:', ticketPrice);
      console.log('Total cost:', totalCost.toString());
      
      // Monthly tickets are tracked separately but use the same buyTicket function
      if (amount === 1) {
        const tx = await contract.methods.buyTicket(account).send({
          from: account,
          value: totalCost.toString()
        });
        console.log('Buy monthly ticket transaction successful:', tx);
        return tx;
      } else {
        const tx = await contract.methods.buyMultipleTickets(account, amount).send({
          from: account,
          value: totalCost.toString()
        });
        console.log('Buy multiple monthly tickets transaction successful:', tx);
        return tx;
      }
    } catch (err) {
      console.error('Error buying monthly tickets:', err);
      throw err;
    }
  }, [contract, account]);

  // Get draw participants with pagination
  const getDrawParticipants = useCallback(async (drawId: number, offset: number = 0, limit: number = 50) => {
    if (!contract) return { participants: [], ticketCounts: [] };
    
    try {
      const result = await contract.methods.getDrawParticipants(drawId, offset, limit).call();
      return {
        participants: result.participants || result[0] || [],
        ticketCounts: result.ticketCounts || result[1] || []
      };
    } catch (err) {
      console.error('Error fetching draw participants:', err);
      return { participants: [], ticketCounts: [] };
    }
  }, [contract]);

  // Get user participation history
  const getUserParticipationHistory = useCallback(async (user: string, offset: number = 0, limit: number = 50) => {
    if (!contract) return { drawIds: [], ticketsBought: [], won: [] };
    
    try {
      const result = await contract.methods.getUserParticipationHistory(user, offset, limit).call();
      return {
        drawIds: result.drawIds || result[0] || [],
        ticketsBought: result.ticketsBought || result[1] || [],
        won: result.won || result[2] || []
      };
    } catch (err) {
      console.error('Error fetching user participation history:', err);
      return { drawIds: [], ticketsBought: [], won: [] };
    }
  }, [contract]);

  // Get current draw info
  const getCurrentDrawInfo = useCallback(async () => {
    if (!contract) return null;
    
    try {
      const info = await contract.methods.getDrawInfo().call();
      return {
        currentDraw: info.currentDraw || info[0],
        currentMonthlyDraw: info.currentMonthlyDraw || info[1],
        drawTime: info.drawTime || info[2],
        monthlyDrawTime: info.monthlyDrawTime || info[3]
      };
    } catch (err) {
      console.error('Error fetching current draw info:', err);
      return null;
    }
  }, [contract]);

  // Get current draw prize
  const getCurrentDrawPrize = useCallback(async () => {
    if (!contract) return '0';
    
    try {
      const prize = await contract.methods.getCurrentDrawPrize().call();
      return prize;
    } catch (err) {
      console.error('Error fetching current draw prize:', err);
      return '0';
    }
  }, [contract]);

  // Get monthly prize
  const getMonthlyPrize = useCallback(async () => {
    if (!contract) return '0';
    
    try {
      const prize = await contract.methods.getMonthlyPrize().call();
      return prize;
    } catch (err) {
      console.error('Error fetching monthly prize:', err);
      return '0';
    }
  }, [contract]);

  // Get ticket price
  const getTicketPrice = useCallback(async () => {
    if (!contract) return '10000000000000000'; // Default 0.01 LYX
    
    try {
      const price = await contract.methods.getTicketPrice().call();
      return price;
    } catch (err) {
      console.error('Error fetching ticket price:', err);
      return '10000000000000000';
    }
  }, [contract]);

  // Edge case improvement functions
  const getExpiredDrawsWaitingExecution = useCallback(async (limit: number = 50) => {
    if (!contract) return { drawIds: [], endTimes: [], participantCounts: [], minParticipants: [] };
    
    try {
      const result = await contract.methods.getExpiredDrawsWaitingExecution(limit).call();
      return {
        drawIds: result.drawIds || result[0] || [],
        endTimes: result.endTimes || result[1] || [],
        participantCounts: result.participantCounts || result[2] || [],
        minParticipants: result.minParticipants || result[3] || []
      };
    } catch (err) {
      console.error('Error fetching expired draws:', err);
      return { drawIds: [], endTimes: [], participantCounts: [], minParticipants: [] };
    }
  }, [contract]);

  const canExecuteDraw = useCallback(async (drawId: number) => {
    if (!contract) return { canExecute: false, reason: 'Contract not available' };
    
    try {
      const result = await contract.methods.canExecuteDraw(drawId).call();
      return {
        canExecute: result.canExecute || result[0] || false,
        reason: result.reason || result[1] || ''
      };
    } catch (err) {
      console.error('Error checking draw execution:', err);
      return { canExecute: false, reason: 'Error checking draw status' };
    }
  }, [contract]);

  const forceExecuteDraw = useCallback(async (drawId: number) => {
    if (!contract || !account) throw new Error('Contract or account not available');
    
    console.log('=== FORCE EXECUTE DRAW ===');
    console.log('Draw ID:', drawId);
    console.log('Account:', account);
    
    try {
      const tx = await contract.methods.forceExecuteDraw(drawId).send({ from: account });
      console.log('Force execute transaction successful:', tx);
      return tx;
    } catch (err) {
      console.error('Error force executing draw:', err);
      throw err;
    }
  }, [contract, account]);

  const refundDraw = useCallback(async (drawId: number) => {
    if (!contract || !account) throw new Error('Contract or account not available');
    
    console.log('=== REFUND DRAW ===');
    console.log('Draw ID:', drawId);
    
    try {
      const tx = await contract.methods.refundDraw(drawId).send({ from: account });
      console.log('Refund draw transaction successful:', tx);
      return tx;
    } catch (err) {
      console.error('Error refunding draw:', err);
      throw err;
    }
  }, [contract, account]);

  const claimRefund = useCallback(async (drawId: number) => {
    if (!contract || !account) throw new Error('Contract or account not available');
    
    console.log('=== CLAIM REFUND ===');
    console.log('Draw ID:', drawId);
    
    try {
      const tx = await contract.methods.claimRefund(drawId).send({ from: account });
      console.log('Claim refund transaction successful:', tx);
      return tx;
    } catch (err) {
      console.error('Error claiming refund:', err);
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
    createDraw,
    getUserDrawExecutorReward,
    getRecentWinners,
    getAdvancedDrawInfo,
    canUserParticipate,
    executeUserDraw,
    buyTickets,
    buyMonthlyTickets,
    getDrawParticipants,
    getUserParticipationHistory,
    getCurrentDrawInfo,
    getCurrentDrawPrize,
    getMonthlyPrize,
    getTicketPrice,
    // Edge case functions
    getExpiredDrawsWaitingExecution,
    canExecuteDraw,
    forceExecuteDraw,
    refundDraw,
    claimRefund
  };
}; 