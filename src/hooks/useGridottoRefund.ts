'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useEthersProvider } from './useEthersProvider';
import { coreAbi } from '@/abi'; // Refund functions are in core ABI

const DIAMOND_ADDRESS = "0x5Ad808FAE645BA3682170467114e5b80A70bF276";

export interface CanClaimResult {
  canClaim: boolean;
  reason: string;
}

export function useGridottoRefund() {
  const { signer, provider, isConnected } = useEthersProvider();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (signer) {
      const refundContract = new ethers.Contract(
        DIAMOND_ADDRESS,
        coreAbi,
        signer
      );
      setContract(refundContract);
    } else if (provider) {
      // Read-only contract for non-connected users
      const refundContract = new ethers.Contract(
        DIAMOND_ADDRESS,
        coreAbi,
        provider
      );
      setContract(refundContract);
    }
  }, [signer, provider]);

  // Claim prize for a won draw
  const claimPrize = async (drawId: number) => {
    if (!contract || !signer) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.claimPrize(drawId);
      const receipt = await tx.wait();
      
      // Extract claim info from events
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'PrizeClaimed';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = contract.interface.parseLog(event);
        return {
          drawId: parsed?.args.drawId,
          winner: parsed?.args.winner,
          amount: parsed?.args.amount
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

  // Claim refund for cancelled draw
  const claimRefund = async (drawId: number) => {
    if (!contract || !signer) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.claimRefund(drawId);
      const receipt = await tx.wait();
      
      // Extract refund info from events
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'RefundClaimed';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = contract.interface.parseLog(event);
        return {
          drawId: parsed?.args.drawId,
          user: parsed?.args.user,
          amount: parsed?.args.amount
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
      const result = await contract.canClaimPrize(drawId, user);
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
      const amount = await contract.getRefundAmount(drawId, user);
      return amount;
    } catch (err: any) {
      console.error('Error fetching refund amount:', err);
      return BigInt(0);
    }
  };

  // Batch claim multiple prizes
  const batchClaimPrizes = async (drawIds: number[]) => {
    if (!contract || !signer) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.batchClaimPrizes(drawIds);
      const receipt = await tx.wait();
      
      // Extract all claim events
      const claimEvents = receipt.logs.filter((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'PrizeClaimed';
        } catch {
          return false;
        }
      });
      
      const claims = claimEvents.map((event: any) => {
        const parsed = contract.interface.parseLog(event);
        return {
          drawId: parsed?.args.drawId,
          winner: parsed?.args.winner,
          amount: parsed?.args.amount
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
    
    const handler = (drawId: bigint, winner: string, amount: bigint) => {
      callback(Number(drawId), winner, amount);
    };
    
    contract.on("PrizeClaimed", handler);
    
    return () => {
      contract.off("PrizeClaimed", handler);
    };
  };

  const onRefundClaimed = (callback: (drawId: number, user: string, amount: bigint) => void) => {
    if (!contract) return () => {};
    
    const handler = (drawId: bigint, user: string, amount: bigint) => {
      callback(Number(drawId), user, amount);
    };
    
    contract.on("RefundClaimed", handler);
    
    return () => {
      contract.off("RefundClaimed", handler);
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