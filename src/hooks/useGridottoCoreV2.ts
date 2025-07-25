'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUPProvider } from './useUPProvider';
import { diamondAbi } from '@/abi';
import Web3 from 'web3';
import { CONTRACTS } from '@/config/contracts';
import { sendTransaction } from '@/utils/luksoTransactionHelper';

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
    ticketPrice: string, // already in Wei
    maxTickets: number,
    duration: number,
    minParticipants: number,
    platformFeePercent: number,
    initialPrize: string = "0" // already in Wei
  ) => {
    if (!contract || !account || !web3) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('[createLYXDraw] Input params:', {
        ticketPrice,
        ticketPriceInLYX: web3.utils.fromWei(ticketPrice, 'ether'),
        maxTickets,
        duration,
        minParticipants,
        platformFeePercent,
        initialPrize,
        initialPrizeInLYX: web3.utils.fromWei(initialPrize, 'ether')
      });
      
      const tx = await sendTransaction(
        contract,
        'createLYXDraw',
        [
          ticketPrice, // Already in Wei, no conversion needed
          maxTickets,
          duration,
          minParticipants,
          platformFeePercent
        ],
        { 
          from: account,
          value: initialPrize // Already in Wei, no conversion needed
        },
        web3,
        account,
        DIAMOND_ADDRESS
      );
      
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
    ticketPrice: string, // already in Wei
    maxTickets: number,
    duration: number,
    minParticipants: number,
    platformFeePercent: number,
    initialPrize: string = "0" // Token amount already in smallest unit
  ) => {
    if (!contract || !account || !web3) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('[createTokenDraw] Input params:', {
        tokenAddress,
        ticketPrice,
        ticketPriceInTokens: web3.utils.fromWei(ticketPrice, 'ether'),
        maxTickets,
        duration,
        minParticipants,
        platformFeePercent,
        initialPrize,
        initialPrizeInTokens: web3.utils.fromWei(initialPrize, 'ether')
      });
      
      const tx = await sendTransaction(
        contract,
        'createTokenDraw',
        [
          tokenAddress,
          ticketPrice, // Already in smallest unit, no conversion needed
          maxTickets,
          duration,
          minParticipants,
          platformFeePercent,
          initialPrize // Already in smallest unit, no conversion needed
        ],
        { from: account },
        web3,
        account,
        DIAMOND_ADDRESS
      );
      
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
    ticketPrice: string, // already in Wei (LYX)
    maxTickets: number,
    duration: number,
    minParticipants: number,
    platformFeePercent: number
  ) => {
    if (!contract || !account || !web3) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('[createNFTDraw] Input params:', {
        nftContract,
        nftTokenIds,
        ticketPrice,
        ticketPriceInLYX: web3.utils.fromWei(ticketPrice, 'ether'),
        maxTickets,
        duration,
        minParticipants,
        platformFeePercent
      });
      
      // Convert token IDs to bytes32
      const bytes32TokenIds = nftTokenIds.map(id => 
        Web3.utils.padLeft(Web3.utils.toHex(id), 64)
      );
      
      // Note: NFT authorization should be done before this
      const tx = await sendTransaction(
        contract,
        'createNFTDraw',
        [
          nftContract,
          bytes32TokenIds,
          ticketPrice, // Already in Wei, no conversion needed
          maxTickets,
          duration,
          minParticipants,
          platformFeePercent
        ],
        { from: account },
        web3,
        account,
        DIAMOND_ADDRESS
      );
      
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

  // Buy tickets - LUKSO UP compatible
  const buyTickets = async (drawId: number, amount: number) => {
    if (!contract || !account || !web3) {
      throw new Error('Wallet not connected');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('[buyTickets] Starting with params:', { drawId, amount, account });
      
      // Get draw details to determine payment
      const details = await contract.methods.getDrawDetails(drawId).call();
      console.log('[buyTickets] Draw details:', details);
      console.log('[buyTickets] Draw type:', details.drawType, 'Type of drawType:', typeof details.drawType);
      console.log('[buyTickets] Ticket price:', details.ticketPrice);
      
      // Convert drawType to number for comparison
      const drawTypeNum = Number(details.drawType);
      console.log('[buyTickets] Draw type as number:', drawTypeNum);
      
      // Check if this is a LYX payment draw (types 0, 2, 3, 4)
      const isLYXPayment = drawTypeNum === 0 || drawTypeNum === 2 || drawTypeNum === 3 || drawTypeNum === 4;
      console.log('[buyTickets] Is LYX payment:', isLYXPayment);
      
      const value = isLYXPayment 
        ? (BigInt(details.ticketPrice) * BigInt(amount)).toString()
        : '0';
      
      console.log('[buyTickets] Calculated transaction value:', value);
      console.log('[buyTickets] Value in ETH:', web3.utils.fromWei(value, 'ether'));
      
      // Use the UP-compatible sendTransaction helper
      const tx = await sendTransaction(
        contract,
        'buyTickets',
        [drawId, amount],
        { 
          from: account,
          value: value
        },
        web3,
        account,
        DIAMOND_ADDRESS
      );
      
      console.log('[buyTickets] Transaction completed:', tx);
      return tx;
    } catch (err: any) {
      console.error('[buyTickets] Error occurred:', err);
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
    
    try {
      const details = await contract.methods.getDrawDetails(drawId).call();
      return {
        creator: details.creator,
        drawType: Number(details.drawType),
        tokenAddress: details.tokenAddress,
        ticketPrice: BigInt(details.ticketPrice),
        maxTickets: BigInt(details.maxTickets),
        ticketsSold: BigInt(details.ticketsSold),
        prizePool: BigInt(details.prizePool),
        startTime: BigInt(details.startTime),
        endTime: BigInt(details.endTime),
        minParticipants: BigInt(details.minParticipants),
        platformFeePercent: BigInt(details.platformFeePercent),
        isCompleted: details.isCompleted,
        isCancelled: details.isCancelled,
        participantCount: BigInt(details.participantCount),
        monthlyPoolContribution: BigInt(details.monthlyPoolContribution)
      };
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
    
    try {
      const draws: any[] = [];
      const nextDrawId = await getNextDrawId();
      
      // If nextDrawId is 0, no draws have been created yet
      if (nextDrawId === 0) {
        console.log('No draws created yet (nextDrawId is 0)');
        return [];
      }
      
      console.log('[getActiveDraws] nextDrawId:', nextDrawId, 'type:', typeof nextDrawId);
      
      // Convert to number if it's not already
      const nextDrawIdNum = Number(nextDrawId);
      
      // Limit to last 20 draws to avoid too many requests
      const startId = Math.max(1, nextDrawIdNum - 20);
      
      console.log('[getActiveDraws] Fetching draws from', startId, 'to', nextDrawIdNum - 1);
      
      // Batch fetch draw details
      const promises = [];
      for (let i = startId; i < nextDrawIdNum; i++) {
        promises.push(getDrawDetails(i));
      }
      
      const results = await Promise.all(promises);
      
      // Filter active draws
      results.forEach((details, index) => {
        if (details && !details.isCompleted && !details.isCancelled) {
          // Convert BigInt values to strings/numbers for safe serialization
          draws.push({ 
            drawId: startId + index,
            creator: details.creator,
            drawType: details.drawType,
            tokenAddress: details.tokenAddress,
            ticketPrice: details.ticketPrice.toString(),
            maxTickets: details.maxTickets.toString(),
            ticketsSold: details.ticketsSold.toString(),
            prizePool: details.prizePool.toString(),
            startTime: Number(details.startTime),
            endTime: Number(details.endTime),
            minParticipants: Number(details.minParticipants),
            platformFeePercent: Number(details.platformFeePercent),
            isCompleted: details.isCompleted,
            isCancelled: details.isCancelled,
            participantCount: Number(details.participantCount),
            monthlyPoolContribution: details.monthlyPoolContribution.toString()
          });
        }
      });
      
      console.log('[getActiveDraws] Found', draws.length, 'active draws');
      return draws;
    } catch (err: any) {
      console.error('Error fetching active draws:', err);
      return [];
    }
  }, [contract, getNextDrawId, getDrawDetails]);

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