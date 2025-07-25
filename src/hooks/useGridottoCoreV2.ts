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
    ticketPrice: string, // in LYX
    maxTickets: number,
    duration: number,
    minParticipants: number,
    platformFeePercent: number,
    initialPrize: string = "0" // in LYX
  ) => {
    if (!contract || !account || !web3) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await sendTransaction(
        contract,
        'createLYXDraw',
        [
          Web3.utils.toWei(ticketPrice, 'ether'),
          maxTickets,
          duration,
          minParticipants,
          platformFeePercent
        ],
        { 
          from: account,
          value: Web3.utils.toWei(initialPrize, 'ether')
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
    ticketPrice: string, // in token units
    maxTickets: number,
    duration: number,
    minParticipants: number,
    platformFeePercent: number,
    initialPrize: string // in token units
  ) => {
    if (!contract || !account || !web3) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      // Note: Token approval should be done before this
      const tx = await sendTransaction(
        contract,
        'createTokenDraw',
        [
          tokenAddress,
          Web3.utils.toWei(ticketPrice, 'ether'), // Assuming 18 decimals
          maxTickets,
          duration,
          minParticipants,
          platformFeePercent,
          Web3.utils.toWei(initialPrize, 'ether')
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
    ticketPrice: string, // in LYX
    maxTickets: number,
    duration: number,
    minParticipants: number,
    platformFeePercent: number
  ) => {
    if (!contract || !account || !web3) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
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
          Web3.utils.toWei(ticketPrice, 'ether'),
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
      
      const value = (details.drawType === '0' || 
                     details.drawType === '2' ||
                     details.drawType === '3' ||
                     details.drawType === '4') 
        ? (BigInt(details.ticketPrice) * BigInt(amount)).toString()
        : '0';
      
      console.log('[buyTickets] Transaction value:', value);
      
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
      
      // Limit to last 20 draws to avoid too many requests
      const startId = Math.max(1, nextDrawId - 20);
      
      // Batch fetch draw details
      const promises = [];
      for (let i = startId; i < nextDrawId; i++) {
        promises.push(getDrawDetails(i));
      }
      
      const results = await Promise.all(promises);
      
      // Filter active draws
      results.forEach((details, index) => {
        if (details && !details.isCompleted && !details.isCancelled) {
          draws.push({ drawId: startId + index, ...details });
        }
      });
      
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