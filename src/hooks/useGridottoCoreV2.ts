'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useUPProvider } from './useUPProvider';
import { diamondAbi } from '@/abi';
import Web3 from 'web3';
import { CONTRACTS } from '@/config/contracts';
import { cache } from '@/utils/cache';

const DIAMOND_ADDRESS = CONTRACTS.LUKSO_TESTNET.DIAMOND;

export enum DrawType {
  USER_LYX = 0,
  USER_LSP7 = 1,
  USER_LSP8 = 2,
  PLATFORM_WEEKLY = 3,
  PLATFORM_MONTHLY = 4
}

export interface DrawDetails {
  creator: string;
  drawType: DrawType;
  tokenAddress: string;
  ticketPrice: bigint;
  maxTickets: bigint;
  ticketsSold: bigint;
  prizePool: bigint;
  startTime: bigint;
  endTime: bigint;
  minParticipants: bigint;
  platformFeePercent: bigint;
  isCompleted: boolean;
  isCancelled: boolean;
  participantCount: bigint;
  monthlyPoolContribution: bigint;
}

export function useGridottoCoreV2() {
  const { web3, account, isConnected } = useUPProvider();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (web3) {
      const coreContract = new web3.eth.Contract(diamondAbi as any, DIAMOND_ADDRESS);
      setContract(coreContract);
    }
  }, [web3]);

  // Create LYX Draw
  const createLYXDraw = async (
    ticketPrice: string, // in LYX
    maxTickets: number,
    duration: number,
    minParticipants: number,
    platformFeePercent: number,
    initialPrize: string = "0" // in LYX
  ) => {
    if (!contract || !account) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.methods.createLYXDraw(
        Web3.utils.toWei(ticketPrice, 'ether'),
        maxTickets,
        duration,
        minParticipants,
        platformFeePercent
      ).send({ 
        from: account,
        value: Web3.utils.toWei(initialPrize, 'ether')
      });
      
      // Extract drawId from events
      const event = tx.events?.DrawCreated;
      if (event) {
        return event.returnValues.drawId;
      }
      
      return null;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create Token Draw (LSP7)
  const createTokenDraw = async (
    tokenAddress: string,
    ticketPrice: string, // in token units
    maxTickets: number,
    duration: number,
    minParticipants: number,
    platformFeePercent: number,
    initialPrize: string // in token units
  ) => {
    if (!contract || !account) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      // Note: Token approval should be done before this
      const tx = await contract.methods.createTokenDraw(
        tokenAddress,
        Web3.utils.toWei(ticketPrice, 'ether'), // Assuming 18 decimals
        maxTickets,
        duration,
        minParticipants,
        platformFeePercent,
        Web3.utils.toWei(initialPrize, 'ether')
      ).send({ from: account });
      
      // Extract drawId from events
      const event = tx.events?.DrawCreated;
      if (event) {
        return event.returnValues.drawId;
      }
      
      return null;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create NFT Draw (LSP8)
  const createNFTDraw = async (
    nftContract: string,
    nftTokenIds: string[], // Will be converted to bytes32
    ticketPrice: string, // in LYX
    maxTickets: number,
    duration: number,
    minParticipants: number,
    platformFeePercent: number
  ) => {
    if (!contract || !account) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      // Convert token IDs to bytes32
      const bytes32TokenIds = nftTokenIds.map(id => 
        Web3.utils.padLeft(Web3.utils.toHex(id), 64)
      );
      
      // Note: NFT authorization should be done before this
      const tx = await contract.methods.createNFTDraw(
        nftContract,
        bytes32TokenIds,
        Web3.utils.toWei(ticketPrice, 'ether'),
        maxTickets,
        duration,
        minParticipants,
        platformFeePercent
      ).send({ from: account });
      
      // Extract drawId from events
      const event = tx.events?.DrawCreated;
      if (event) {
        return event.returnValues.drawId;
      }
      
      return null;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Buy tickets
  const buyTickets = async (drawId: number, amount: number) => {
    if (!contract || !account) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      // Get draw details to determine payment
      const details = await contract.methods.getDrawDetails(drawId).call();
      
      if (details.drawType === '0' || 
          details.drawType === '2' ||
          details.drawType === '3' ||
          details.drawType === '4') {
        // LYX payment
        const totalCost = BigInt(details.ticketPrice) * BigInt(amount);
        const tx = await contract.methods.buyTickets(drawId, amount).send({ 
          from: account,
          value: totalCost.toString()
        });
        return tx;
      } else if (details.drawType === '1') {
        // Token payment - approval should be done before
        const tx = await contract.methods.buyTickets(drawId, amount).send({ from: account });
        return tx;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get draw details
  const getDrawDetails = useCallback(async (drawId: number): Promise<DrawDetails | null> => {
    if (!contract) return null;
    
    // Validate drawId
    if (!drawId || isNaN(drawId) || drawId <= 0) {
      console.error('Invalid drawId provided to getDrawDetails:', drawId);
      return null;
    }
    
    // Check cache first
    const cacheKey = `drawDetails_${drawId}`;
    const cachedDetails = cache.get<DrawDetails>(cacheKey);
    if (cachedDetails) {
      return cachedDetails;
    }
    
    try {
      const details = await contract.methods.getDrawDetails(drawId).call();
      
      // Handle both tuple and separate values format
      let creator, drawType, tokenAddress, ticketPrice, maxTickets, ticketsSold, 
          prizePool, startTime, endTime, minParticipants, platformFeePercent, 
          isCompleted, isCancelled, participantCount, monthlyPoolContribution;
      
      if (details.creator !== undefined) {
        // Tuple format (old ABI)
        creator = details.creator;
        drawType = details.drawType;
        tokenAddress = details.tokenAddress;
        ticketPrice = details.ticketPrice;
        maxTickets = details.maxTickets;
        ticketsSold = details.ticketsSold;
        prizePool = details.prizePool;
        startTime = details.startTime;
        endTime = details.endTime;
        minParticipants = details.minParticipants;
        platformFeePercent = details.platformFeePercent;
        isCompleted = details.isCompleted;
        isCancelled = details.isCancelled;
        participantCount = details.participantCount;
        monthlyPoolContribution = details.monthlyPoolContribution;
      } else if (Array.isArray(details)) {
        // Array format (new contract)
        [creator, drawType, tokenAddress, ticketPrice, maxTickets, ticketsSold, 
         prizePool, startTime, endTime, minParticipants, platformFeePercent, 
         isCompleted, isCancelled, participantCount, monthlyPoolContribution] = details;
      } else {
        console.error('Unexpected getDrawDetails response format:', details);
        return null;
      }
      
      const formattedDetails: DrawDetails = {
        creator,
        drawType: Number(drawType),
        tokenAddress,
        ticketPrice: BigInt(ticketPrice),
        maxTickets: BigInt(maxTickets),
        ticketsSold: BigInt(ticketsSold),
        prizePool: BigInt(prizePool),
        startTime: BigInt(startTime),
        endTime: BigInt(endTime),
        minParticipants: BigInt(minParticipants),
        platformFeePercent: BigInt(platformFeePercent),
        isCompleted,
        isCancelled,
        participantCount: BigInt(participantCount),
        monthlyPoolContribution: BigInt(monthlyPoolContribution)
      };
      
      // Cache for 2 minutes if active, 10 minutes if completed/cancelled
      const cacheTtl = formattedDetails.isCompleted || formattedDetails.isCancelled ? 600 : 120;
      cache.set(cacheKey, formattedDetails, cacheTtl);
      
      return formattedDetails;
    } catch (err: any) {
      console.error('Error fetching draw details:', err);
      return null;
    }
  }, [contract]);

  // Get user draw history
  const getUserDrawHistory = async (user: string): Promise<number[]> => {
    if (!contract) return [];
    
    try {
      const history = await contract.methods.getUserDrawHistory(user).call();
      // Filter out invalid draw IDs
      return history
        .map((id: string) => Number(id))
        .filter((id: number) => !isNaN(id) && id > 0);
    } catch (err: any) {
      console.error('Error fetching user draw history:', err);
      return [];
    }
  };

  // Cancel draw (only creator or admin)
  const cancelDraw = async (drawId: number) => {
    if (!contract || !account) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.methods.cancelDraw(drawId).send({ from: account });
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get next draw ID
  const getNextDrawId = useCallback(async (): Promise<number> => {
    if (!contract) return 0;
    
    try {
      const nextId = await contract.methods.getNextDrawId().call();
      return Number(nextId);
    } catch (err: any) {
      console.error('Error fetching next draw ID:', err);
      return 0;
    }
  }, [contract]);

  // Get active draws
  const getActiveDraws = useCallback(async (): Promise<any[]> => {
    if (!contract) return [];
    
    // Check cache first
    const cacheKey = 'activeDraws';
    const cachedDraws = cache.get<any[]>(cacheKey);
    if (cachedDraws) {
      return cachedDraws;
    }
    
    try {
      const draws: any[] = [];
      const nextDrawId = await getNextDrawId();
      
      // If nextDrawId is 0, no draws have been created yet
      if (nextDrawId === 0) {
        console.log('No draws created yet (nextDrawId is 0)');
        cache.set(cacheKey, [], 120); // Cache empty result for 2 minutes
        return [];
      }
      
      // Limit to last 20 draws to avoid too many requests
      const startId = Math.max(1, nextDrawId - 20);
      
      // Batch fetch draw details - but limit concurrent requests
      const batchSize = 5; // Process 5 draws at a time
      const allResults: any[] = [];
      
      for (let i = startId; i < nextDrawId; i += batchSize) {
        const batch = [];
        for (let j = i; j < Math.min(i + batchSize, nextDrawId); j++) {
          batch.push(getDrawDetails(j));
        }
        
        const batchResults = await Promise.all(batch);
        allResults.push(...batchResults);
      }
      
      // Filter active draws
      allResults.forEach((details, index) => {
        if (details && !details.isCompleted && !details.isCancelled) {
          draws.push({ drawId: startId + index, ...details });
        }
      });
      
      // Cache the results for 2 minutes
      cache.set(cacheKey, draws, 120);
      
      return draws;
    } catch (err: any) {
      console.error('Error fetching active draws:', err);
      return [];
    }
  }, [contract, getDrawDetails, getNextDrawId]);

  return {
    contract,
    loading,
    error,
    isConnected,
    createLYXDraw,
    createTokenDraw,
    createNFTDraw,
    buyTickets,
    getDrawDetails,
    getUserDrawHistory,
    cancelDraw,
    getNextDrawId,
    getActiveDraws
  };
}