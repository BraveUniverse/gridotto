'use client';

import { useState, useEffect } from 'react';
import { useUPProvider } from './useUPProvider';
import { diamondAbi } from '@/abi';
import Web3 from 'web3';
import { CONTRACTS } from '@/config/contracts';

const DIAMOND_ADDRESS = CONTRACTS.LUKSO_TESTNET.DIAMOND;

export interface DrawWinners {
  winners: string[];
  amounts: bigint[];
}

export interface CanExecuteResult {
  canExecute: boolean;
  reason: string;
}

export function useGridottoExecutionV2() {
  const { web3, account, isConnected } = useUPProvider();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (web3) {
      const executionContract = new web3.eth.Contract(diamondAbi as any, DIAMOND_ADDRESS);
      setContract(executionContract);
    }
  }, [web3]);

  // Execute draw
  const executeDraw = async (drawId: number) => {
    if (!contract || !account) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.methods.executeDraw(drawId).send({ from: account });
      
      // Extract winner info from events
      const event = tx.events?.DrawExecuted;
      if (event) {
        return {
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

  // Get draw winners
  const getDrawWinners = async (drawId: number): Promise<DrawWinners | null> => {
    if (!contract) return null;
    
    try {
      const result = await contract.methods.getDrawWinners(drawId).call();
      return {
        winners: result[0] || result.winners || [],
        amounts: (result[1] || result.amounts || []).map((a: string) => BigInt(a))
      };
    } catch (err: any) {
      console.error('Error fetching draw winners:', err);
      return null;
    }
  };

  // Check if draw can be executed
  const canExecuteDraw = async (drawId: number): Promise<CanExecuteResult> => {
    if (!contract) return { canExecute: false, reason: 'Contract not loaded' };
    
    try {
      const result = await contract.methods.canExecuteDraw(drawId).call();
      return {
        canExecute: result[0] || result.canExecute || false,
        reason: result[1] || result.reason || ''
      };
    } catch (err: any) {
      console.error('Error checking draw execution:', err);
      return { canExecute: false, reason: 'Error checking draw status' };
    }
  };

  // Set up event listeners
  const onDrawExecuted = (callback: (drawId: number, executor: string, winners: string[]) => void) => {
    if (!contract) return () => {};
    
    const handler = (error: any, event: any) => {
      if (!error && event) {
        callback(
          Number(event.returnValues.drawId),
          event.returnValues.executor,
          event.returnValues.winners
        );
      }
    };
    
    contract.events.DrawExecuted({}, handler);
    
    return () => {
      contract.events.DrawExecuted().unsubscribe();
    };
  };

  return {
    contract,
    loading,
    error,
    isConnected,
    executeDraw,
    getDrawWinners,
    canExecuteDraw,
    onDrawExecuted
  };
}