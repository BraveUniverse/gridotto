'use client';

import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useUPProvider } from './useUPProvider';
import { diamondAbi } from '@/abi';
import { CONTRACTS } from '@/config/contracts';
import { sendTransaction } from '@/utils/luksoTransactionHelper';

const DIAMOND_ADDRESS = CONTRACTS.LUKSO_TESTNET.DIAMOND;

export interface CanClaimResult {
  canClaim: boolean;
  reason: string;
}

export function useGridottoRefund() {
  const { web3, account, isConnected } = useUPProvider();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (web3) {
      const refundContract = new web3.eth.Contract(
        diamondAbi as any,
        DIAMOND_ADDRESS
      );
      setContract(refundContract);
    }
  }, [web3]);

  // Claim prize for a won draw - LUKSO UP compatible
  const claimPrize = async (drawId: number) => {
    if (!contract || !account || !web3) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await sendTransaction(
        contract,
        'claimPrize',
        [drawId],
        { from: account },
        web3,
        account,
        DIAMOND_ADDRESS
      );
      
      // Extract claim info from events
      const event = tx.events?.PrizeClaimed;
      
      if (event) {
        return {
          drawId: event.returnValues.drawId,
          winner: event.returnValues.winner,
          amount: event.returnValues.amount
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

  // Claim refund for cancelled draw - LUKSO UP compatible
  const claimRefund = async (drawId: number) => {
    if (!contract || !account || !web3) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await sendTransaction(
        contract,
        'claimRefund',
        [drawId],
        { from: account },
        web3,
        account,
        DIAMOND_ADDRESS
      );
      
      // Extract refund info from events
      const event = tx.events?.RefundClaimed;
      
      if (event) {
        return {
          drawId: event.returnValues.drawId,
          user: event.returnValues.user,
          amount: event.returnValues.amount
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

  // Check if user can claim prize
  const canClaimPrize = async (drawId: number, user: string): Promise<CanClaimResult> => {
    if (!contract) return { canClaim: false, reason: 'Contract not loaded' };
    
    try {
      const result = await contract.methods.canClaimPrize(drawId, user).call();
      return {
        canClaim: result[0] || result.canClaim || false,
        reason: result[1] || result.reason || ''
      };
    } catch (err: any) {
      console.error('Error checking prize claim:', err);
      return { canClaim: false, reason: 'Error checking claim status' };
    }
  };

  // Get refund amount for cancelled draw
  const getRefundAmount = async (drawId: number, user: string): Promise<bigint> => {
    if (!contract) return BigInt(0);
    
    try {
      const amount = await contract.methods.getRefundAmount(drawId, user).call();
      return amount;
    } catch (err: any) {
      console.error('Error fetching refund amount:', err);
      return BigInt(0);
    }
  };

  // Batch claim multiple prizes - LUKSO UP compatible
  const batchClaimPrizes = async (drawIds: number[]) => {
    if (!contract || !account || !web3) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await sendTransaction(
        contract,
        'batchClaimPrizes',
        [drawIds],
        { from: account },
        web3,
        account,
        DIAMOND_ADDRESS
      );
      
      // Extract all claim events
      const claimEvents = tx.events?.PrizeClaimed || [];
      const eventsArray = Array.isArray(claimEvents) ? claimEvents : [claimEvents];
      
      const claims = eventsArray.map((event: any) => {
        return {
          drawId: event.returnValues.drawId,
          winner: event.returnValues.winner,
          amount: event.returnValues.amount
        };
      });
      
      return claims;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Set up event listeners
  const onPrizeClaimed = (callback: (drawId: number, winner: string, amount: bigint) => void) => {
    if (!contract) return () => {};
    
    const handler = (error: any, event: any) => {
      if (!error && event) {
        callback(Number(event.returnValues.drawId), event.returnValues.winner, BigInt(event.returnValues.amount));
      }
    };
    
    contract.events.PrizeClaimed({}, handler);
    
    return () => {
      contract.events.PrizeClaimed().unsubscribe();
    };
  };

  const onRefundClaimed = (callback: (drawId: number, user: string, amount: bigint) => void) => {
    if (!contract) return () => {};
    
    const handler = (error: any, event: any) => {
      if (!error && event) {
        callback(Number(event.returnValues.drawId), event.returnValues.user, BigInt(event.returnValues.amount));
      }
    };
    
    contract.events.RefundClaimed({}, handler);
    
    return () => {
      contract.events.RefundClaimed().unsubscribe();
    };
  };

  return {
    contract,
    loading,
    error,
    isConnected,
    claimPrize,
    claimRefund,
    canClaimPrize,
    getRefundAmount,
    batchClaimPrizes,
    onPrizeClaimed,
    onRefundClaimed
  };
}