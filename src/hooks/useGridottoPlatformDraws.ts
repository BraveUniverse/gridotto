'use client';

import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useUPProvider } from './useUPProvider';
import { diamondAbi } from '@/abi';

const DIAMOND_ADDRESS = "0x5Ad808FAE645BA3682170467114e5b80A70bF276";

export interface PlatformDrawsInfo {
  weeklyDrawId: bigint;
  monthlyDrawId: bigint;
  weeklyEndTime?: bigint;
  monthlyEndTime?: bigint;
  monthlyPoolBalance: bigint;
  weeklyCount?: bigint;
  // Legacy fields for compatibility
  lastWeeklyDrawTime: bigint;
  nextMonthlyDraw: bigint;
  // Additional fields that might be needed
  monthlyDrawTime?: bigint;
}

export interface MonthlyTickets {
  fromWeekly: bigint;
  fromCreating: bigint;
  fromParticipating: bigint;
  lastResetTime: bigint;
}

export function useGridottoPlatformDraws() {
  const { web3, account, isConnected } = useUPProvider();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (web3) {
      const platformContract = new web3.eth.Contract(
        diamondAbi as any,
        DIAMOND_ADDRESS
      );
      setContract(platformContract);
    }
  }, [web3]);

  // Initialize platform draws (admin only)
  const initializePlatformDraws = async () => {
    if (!contract || !account) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.methods.initializePlatformDraws().send({ from: account });
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Execute weekly draw
  const executeWeeklyDraw = async () => {
    if (!contract || !account) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.methods.executeWeeklyDraw().send({ from: account });
      
      // Extract winner info from events
      const event = tx.events?.DrawExecuted;
      
      if (event) {
        return {
          drawId: event.returnValues.drawId,
          executor: event.returnValues.executor,
          winners: event.returnValues.winners
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
    if (!contract || !account) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.methods.executeMonthlyDraw().send({ from: account });
      
      // Extract winner info from events
      const event = tx.events?.DrawExecuted;
      
      if (event) {
        return {
          drawId: event.returnValues.drawId,
          executor: event.returnValues.executor,
          winners: event.returnValues.winners
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
    if (!contract) {
      console.log('[getPlatformDrawsInfo] No contract available');
      return null;
    }
    
    try {
      console.log('[getPlatformDrawsInfo] Calling contract method...');
      const info = await contract.methods.getPlatformDrawsInfo().call();
      console.log('[getPlatformDrawsInfo] Raw response from contract:', info);
      
      // Handle both object and array response formats
      if (Array.isArray(info)) {
        // Array format: [weeklyDrawId, monthlyDrawId, weeklyEndTime, monthlyEndTime, monthlyPoolBalance, weeklyCount]
        const result = {
          weeklyDrawId: info[0],
          monthlyDrawId: info[1], 
          weeklyEndTime: info[2],
          monthlyEndTime: info[3],
          monthlyPoolBalance: info[4],
          weeklyCount: info[5] || 0,
          // Legacy fields for compatibility
          lastWeeklyDrawTime: info[2], // Using weeklyEndTime as lastWeeklyDrawTime
          nextMonthlyDraw: info[3] // Using monthlyEndTime
        };
        console.log('[getPlatformDrawsInfo] Parsed array format:', result);
        return result;
      } else if (info && typeof info === 'object') {
        // Object format
        const result = {
          weeklyDrawId: info.weeklyDrawId || info[0],
          monthlyDrawId: info.monthlyDrawId || info[1],
          weeklyEndTime: info.weeklyEndTime || info[2],
          monthlyEndTime: info.monthlyEndTime || info[3],
          monthlyPoolBalance: info.monthlyPoolBalance || info[4],
          weeklyCount: info.weeklyCount || info[5] || 0,
          // Legacy fields for compatibility
          lastWeeklyDrawTime: info.weeklyEndTime || info.lastWeeklyDrawTime || info[2],
          nextMonthlyDraw: info.monthlyEndTime || info.nextMonthlyDraw || info[3]
        };
        console.log('[getPlatformDrawsInfo] Parsed object format:', result);
        return result;
      }
      
      console.warn('Unexpected getPlatformDrawsInfo response format:', info);
      return null;
    } catch (err: any) {
      console.error('[getPlatformDrawsInfo] Error:', err.message);
      // Only log error if it's not a "function not found" error
      if (!err.message?.includes('does not exist') && !err.message?.includes('Method not found')) {
        console.error('Error fetching platform draws info:', err.message);
      }
      return null;
    }
  };

  // Get user monthly tickets
  const getUserMonthlyTickets = async (user: string): Promise<MonthlyTickets | null> => {
    if (!contract) return null;
    
    try {
      const tickets = await contract.methods.getUserMonthlyTickets(user).call();
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