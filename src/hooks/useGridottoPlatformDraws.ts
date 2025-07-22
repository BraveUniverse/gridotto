'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useEthersProvider } from './useEthersProvider';
import { coreAbi } from '@/abi'; // Platform draws are in core ABI

const DIAMOND_ADDRESS = "0x5Ad808FAE645BA3682170467114e5b80A70bF276";

export interface PlatformDrawsInfo {
  weeklyDrawId: bigint;
  monthlyDrawId: bigint;
  monthlyPoolBalance: bigint;
  lastWeeklyDrawTime: bigint;
  nextMonthlyDraw: bigint;
}

export interface MonthlyTickets {
  fromWeekly: bigint;
  fromCreating: bigint;
  fromParticipating: bigint;
  lastResetTime: bigint;
}

export function useGridottoPlatformDraws() {
  const { signer, provider, isConnected } = useEthersProvider();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (signer) {
      const platformContract = new ethers.Contract(
        DIAMOND_ADDRESS,
        coreAbi,
        signer
      );
      setContract(platformContract);
    } else if (provider) {
      // Read-only contract for non-connected users
      const platformContract = new ethers.Contract(
        DIAMOND_ADDRESS,
        coreAbi,
        provider
      );
      setContract(platformContract);
    }
  }, [signer, provider]);

  // Initialize platform draws (admin only)
  const initializePlatformDraws = async () => {
    if (!contract || !signer) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.initializePlatformDraws();
      await tx.wait();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Execute weekly draw
  const executeWeeklyDraw = async () => {
    if (!contract || !signer) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.executeWeeklyDraw();
      const receipt = await tx.wait();
      
      // Extract winner info from events
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'DrawExecuted';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = contract.interface.parseLog(event);
        return {
          drawId: parsed?.args.drawId,
          executor: parsed?.args.executor,
          winners: parsed?.args.winners
        };
      }
      
      return null;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Execute monthly draw
  const executeMonthlyDraw = async () => {
    if (!contract || !signer) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.executeMonthlyDraw();
      const receipt = await tx.wait();
      
      // Extract winner info from events
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'DrawExecuted';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = contract.interface.parseLog(event);
        return {
          drawId: parsed?.args.drawId,
          executor: parsed?.args.executor,
          winners: parsed?.args.winners
        };
      }
      
      return null;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get platform draws info
  const getPlatformDrawsInfo = async (): Promise<PlatformDrawsInfo | null> => {
    if (!contract) return null;
    
    try {
      const info = await contract.getPlatformDrawsInfo();
      return {
        weeklyDrawId: info.weeklyDrawId || info[0],
        monthlyDrawId: info.monthlyDrawId || info[1],
        monthlyPoolBalance: info.monthlyPoolBalance || info[2],
        lastWeeklyDrawTime: info.lastWeeklyDrawTime || info[3],
        nextMonthlyDraw: info.nextMonthlyDraw || info[4]
      };
    } catch (err: any) {
      console.error('Error fetching platform draws info:', err);
      return null;
    }
  };

  // Get user monthly tickets
  const getUserMonthlyTickets = async (user: string): Promise<MonthlyTickets | null> => {
    if (!contract) return null;
    
    try {
      const tickets = await contract.getUserMonthlyTickets(user);
      return {
        fromWeekly: tickets.fromWeekly || tickets[0],
        fromCreating: tickets.fromCreating || tickets[1],
        fromParticipating: tickets.fromParticipating || tickets[2],
        lastResetTime: tickets.lastResetTime || tickets[3]
      };
    } catch (err: any) {
      console.error('Error fetching user monthly tickets:', err);
      return null;
    }
  };

  return {
    contract,
    loading,
    error,
    isConnected,
    initializePlatformDraws,
    executeWeeklyDraw,
    executeMonthlyDraw,
    getPlatformDrawsInfo,
    getUserMonthlyTickets
  };
}