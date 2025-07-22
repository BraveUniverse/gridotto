'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useEthersProvider } from './useEthersProvider';
import { coreAbi } from '@/abi';

const DIAMOND_ADDRESS = "0x5Ad808FAE645BA3682170467114e5b80A70bF276";

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
  const { signer, provider, isConnected } = useEthersProvider();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (signer) {
      const coreContract = new ethers.Contract(
        DIAMOND_ADDRESS,
        coreAbi,
        signer
      );
      setContract(coreContract);
    } else if (provider) {
      // Read-only contract for non-connected users
      const coreContract = new ethers.Contract(
        DIAMOND_ADDRESS,
        coreAbi,
        provider
      );
      setContract(coreContract);
    }
  }, [signer, provider]);

  // Create LYX Draw
  const createLYXDraw = async (
    ticketPrice: string, // in LYX
    maxTickets: number,
    duration: number,
    minParticipants: number,
    platformFeePercent: number,
    initialPrize: string = "0" // in LYX
  ) => {
    if (!contract || !signer) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.createLYXDraw(
        ethers.parseEther(ticketPrice),
        maxTickets,
        duration,
        minParticipants,
        platformFeePercent,
        { value: ethers.parseEther(initialPrize) }
      );
      
      const receipt = await tx.wait();
      
      // Extract drawId from events
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'DrawCreated';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = contract.interface.parseLog(event);
        return parsed?.args.drawId;
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
    if (!contract || !signer) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      // Note: Token approval should be done before this
      const tx = await contract.createTokenDraw(
        tokenAddress,
        ethers.parseEther(ticketPrice), // Assuming 18 decimals
        maxTickets,
        duration,
        minParticipants,
        platformFeePercent,
        ethers.parseEther(initialPrize)
      );
      
      const receipt = await tx.wait();
      
      // Extract drawId from events
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'DrawCreated';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = contract.interface.parseLog(event);
        return parsed?.args.drawId;
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
    if (!contract || !signer) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      // Convert token IDs to bytes32
      const bytes32TokenIds = nftTokenIds.map(id => 
        ethers.zeroPadValue(ethers.toBeHex(id), 32)
      );
      
      // Note: NFT authorization should be done before this
      const tx = await contract.createNFTDraw(
        nftContract,
        bytes32TokenIds,
        ethers.parseEther(ticketPrice),
        maxTickets,
        duration,
        minParticipants,
        platformFeePercent
      );
      
      const receipt = await tx.wait();
      
      // Extract drawId from events
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'DrawCreated';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = contract.interface.parseLog(event);
        return parsed?.args.drawId;
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
    if (!contract || !signer) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      // Get draw details to determine payment
      const details = await contract.getDrawDetails(drawId);
      
      if (details.drawType === DrawType.USER_LYX || 
          details.drawType === DrawType.USER_LSP8 ||
          details.drawType === DrawType.PLATFORM_WEEKLY ||
          details.drawType === DrawType.PLATFORM_MONTHLY) {
        // LYX payment
        const totalCost = details.ticketPrice * BigInt(amount);
        const tx = await contract.buyTickets(drawId, amount, { value: totalCost });
        await tx.wait();
      } else if (details.drawType === DrawType.USER_LSP7) {
        // Token payment - approval should be done before
        const tx = await contract.buyTickets(drawId, amount);
        await tx.wait();
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get draw details
  const getDrawDetails = async (drawId: number): Promise<DrawDetails | null> => {
    if (!contract) return null;
    
    try {
      const details = await contract.getDrawDetails(drawId);
      return {
        creator: details.creator,
        drawType: Number(details.drawType),
        tokenAddress: details.tokenAddress,
        ticketPrice: details.ticketPrice,
        maxTickets: details.maxTickets,
        ticketsSold: details.ticketsSold,
        prizePool: details.prizePool,
        startTime: details.startTime,
        endTime: details.endTime,
        minParticipants: details.minParticipants,
        platformFeePercent: details.platformFeePercent,
        isCompleted: details.isCompleted,
        isCancelled: details.isCancelled,
        participantCount: details.participantCount,
        monthlyPoolContribution: details.monthlyPoolContribution
      };
    } catch (err: any) {
      console.error('Error fetching draw details:', err);
      return null;
    }
  };

  // Get user draw history
  const getUserDrawHistory = async (user: string): Promise<number[]> => {
    if (!contract) return [];
    
    try {
      const history = await contract.getUserDrawHistory(user);
      return history.map((id: bigint) => Number(id));
    } catch (err: any) {
      console.error('Error fetching user draw history:', err);
      return [];
    }
  };

  // Cancel draw (only creator or admin)
  const cancelDraw = async (drawId: number) => {
    if (!contract || !signer) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.cancelDraw(drawId);
      await tx.wait();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get next draw ID
  const getNextDrawId = async (): Promise<number> => {
    if (!contract) return 0;
    
    try {
      const nextId = await contract.getNextDrawId();
      return Number(nextId);
    } catch (err: any) {
      console.error('Error fetching next draw ID:', err);
      return 0;
    }
  };

  // Get active draws
  const getActiveDraws = async (): Promise<any[]> => {
    if (!contract) return [];
    
    try {
      const draws = [];
      const nextDrawId = await getNextDrawId();
      
      // Fetch all draws and filter active ones
      for (let i = 1; i < nextDrawId; i++) {
        const details = await getDrawDetails(i);
        if (details && !details.isCompleted && !details.isCancelled) {
          draws.push({ id: i, ...details });
        }
      }
      
      return draws;
    } catch (err: any) {
      console.error('Error fetching active draws:', err);
      return [];
    }
  };

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