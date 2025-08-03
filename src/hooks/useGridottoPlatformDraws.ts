'use client';

import { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import { useUPProvider } from './useUPProvider';
import { COMPLETE_DIAMOND_ABI } from '@/abi/completeDiamondAbi';
import { sendTransaction } from '@/utils/luksoTransactionHelper';
import { CONTRACTS } from '@/config/contracts';

const DIAMOND_ADDRESS = CONTRACTS.LUKSO_TESTNET.DIAMOND;

export interface PlatformDrawsInfo {
  weeklyDrawId: bigint;
  monthlyDrawId: bigint;
  weeklyEndTime: bigint;
  monthlyEndTime: bigint;
  monthlyPoolBalance: bigint;
  weeklyCount: bigint;
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
        COMPLETE_DIAMOND_ABI as any,
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
  const getPlatformDrawsInfo = useCallback(async (): Promise<PlatformDrawsInfo | null> => {
    if (!contract) {
      console.log('[getPlatformDrawsInfo] Contract not available');
      return null;
    }
    
    try {
      console.log('[getPlatformDrawsInfo] Calling contract method...');
      const info = await contract.methods.getPlatformDrawsInfo().call();
      // Custom replacer for BigInt values
      const bigIntReplacer = (key: string, value: any) => {
        return typeof value === 'bigint' ? value.toString() + 'n' : value;
      };
      
      console.log('[getPlatformDrawsInfo] Raw response from contract:', JSON.stringify(info, bigIntReplacer, 2));
      console.log('[getPlatformDrawsInfo] Raw response type:', typeof info);
      console.log('[getPlatformDrawsInfo] Raw response is array:', Array.isArray(info));
      
      if (Array.isArray(info)) {
        console.log('[getPlatformDrawsInfo] Array elements:');
        info.forEach((item, index) => {
          console.log(`  [${index}]: ${typeof item === 'bigint' ? item.toString() + 'n' : item} (type: ${typeof item})`);
        });
      } else {
        console.log('[getPlatformDrawsInfo] Object properties:');
        Object.keys(info).forEach(key => {
          const value = info[key];
          console.log(`  ${key}: ${typeof value === 'bigint' ? value.toString() + 'n' : value} (type: ${typeof value})`);
        });
      }
      
      const result = {
        weeklyDrawId: info.weeklyDrawId || info[0],
        monthlyDrawId: info.monthlyDrawId || info[1],
        weeklyEndTime: info.weeklyEndTime || info[2],
        monthlyEndTime: info.monthlyEndTime || info[3],
        monthlyPoolBalance: info.monthlyPoolBalance || info[4],
        weeklyCount: info.weeklyCount || info[5]
      };
      
      console.log('[getPlatformDrawsInfo] Parsed object format:', JSON.stringify(result, bigIntReplacer, 2));
      return result;
    } catch (err: any) {
      console.error('[getPlatformDrawsInfo] Error fetching platform draws info:', err);
      return null;
    }
  }, [contract]);

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