'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUPProvider } from './useUPProvider';
import { CONTRACTS } from '@/config/contracts';
import { executionAbi } from '@/abi';
import Web3 from 'web3';

export const useGridottoExecution = () => {
  const { web3, account } = useUPProvider();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initContract = async () => {
      if (!web3) return;

      try {
        setLoading(true);
        
        const contractInstance = new web3.eth.Contract(
          executionAbi as any,
          CONTRACTS.LUKSO_TESTNET.DIAMOND
        );
        
        setContract(contractInstance);
        setError(null);
      } catch (err) {
        console.error('Error initializing execution contract:', err);
        setError('Failed to initialize contract');
      } finally {
        setLoading(false);
      }
    };

    initContract();
  }, [web3]);

  // Check if draw can be executed
  const canExecuteDraw = useCallback(async (drawId: number) => {
    if (!contract) return false;
    
    try {
      const canExecute = await contract.methods.canExecuteDraw(drawId).call();
      return canExecute;
    } catch (err) {
      console.error('Error checking draw execution:', err);
      return false;
    }
  }, [contract]);

  // Execute draw
  const executeDraw = useCallback(async (drawId: number) => {
    if (!contract || !account) throw new Error('Contract or account not available');
    
    const tx = await contract.methods.executeDraw(drawId).send({ from: account });
    return tx;
  }, [contract, account]);

  // Get draw winners
  const getDrawWinners = useCallback(async (drawId: number) => {
    if (!contract) return { winners: [], amounts: [] };
    
    try {
      const result = await contract.methods.getDrawWinners(drawId).call();
      return {
        winners: result[0] || result.winners || [],
        amounts: result[1] || result.amounts || []
      };
    } catch (err) {
      console.error('Error fetching draw winners:', err);
      return { winners: [], amounts: [] };
    }
  }, [contract]);

  // Claim prize
  const claimPrize = useCallback(async (drawId: number) => {
    if (!contract || !account) throw new Error('Contract or account not available');
    
    const tx = await contract.methods.claimPrize(drawId).send({ from: account });
    return tx;
  }, [contract, account]);

  // Get claimable prizes for user
  const getUserClaimablePrizes = useCallback(async (user: string) => {
    if (!contract) return [];
    
    try {
      const prizes = await contract.methods.getUserClaimablePrizes(user).call();
      return prizes;
    } catch (err) {
      console.error('Error fetching claimable prizes:', err);
      return [];
    }
  }, [contract]);

  // Batch claim all prizes
  const claimAllPrizes = useCallback(async () => {
    if (!contract || !account) throw new Error('Contract or account not available');
    
    const tx = await contract.methods.claimAllPrizes().send({ from: account });
    return tx;
  }, [contract, account]);

  // Get execution reward for a draw
  const getExecutionReward = useCallback(async (drawId: number) => {
    if (!contract) return '0';
    
    try {
      const reward = await contract.methods.getExecutionReward(drawId).call();
      return reward;
    } catch (err) {
      console.error('Error fetching execution reward:', err);
      return '0';
    }
  }, [contract]);

  // Get draws ready for execution
  const getDrawsReadyForExecution = useCallback(async (offset: number = 0, limit: number = 50) => {
    if (!contract) return [];
    
    try {
      const draws = await contract.methods.getDrawsReadyForExecution(offset, limit).call();
      return draws;
    } catch (err) {
      console.error('Error fetching draws ready for execution:', err);
      return [];
    }
  }, [contract]);

  return {
    contract,
    loading,
    error,
    canExecuteDraw,
    executeDraw,
    getDrawWinners,
    claimPrize,
    getUserClaimablePrizes,
    claimAllPrizes,
    getExecutionReward,
    getDrawsReadyForExecution
  };
};