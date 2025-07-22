'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useEthersProvider } from './useEthersProvider';
import { executionAbi } from '@/abi';

const DIAMOND_ADDRESS = "0x5Ad808FAE645BA3682170467114e5b80A70bF276";

export interface DrawWinners {
  winners: string[];
  amounts: bigint[];
}

export interface CanExecuteResult {
  canExecute: boolean;
  reason: string;
}

export function useGridottoExecutionV2() {
  const { signer, provider, isConnected } = useEthersProvider();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (signer) {
      const executionContract = new ethers.Contract(
        DIAMOND_ADDRESS,
        executionAbi,
        signer
      );
      setContract(executionContract);
    } else if (provider) {
      // Read-only contract for non-connected users
      const executionContract = new ethers.Contract(
        DIAMOND_ADDRESS,
        executionAbi,
        provider
      );
      setContract(executionContract);
    }
  }, [signer, provider]);

  // Execute draw
  const executeDraw = async (drawId: number) => {
    if (!contract || !signer) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.executeDraw(drawId);
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

  // Get draw winners
  const getDrawWinners = async (drawId: number): Promise<DrawWinners | null> => {
    if (!contract) return null;
    
    try {
      const result = await contract.getDrawWinners(drawId);
      return {
        winners: result[0] || result.winners || [],
        amounts: result[1] || result.amounts || []
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
      const result = await contract.canExecuteDraw(drawId);
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
    
    const handler = (drawId: bigint, executor: string, winners: string[]) => {
      callback(Number(drawId), executor, winners);
    };
    
    contract.on("DrawExecuted", handler);
    
    return () => {
      contract.off("DrawExecuted", handler);
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