'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUPProvider } from './useUPProvider';
import { CONTRACTS } from '@/config/contracts';
import { coreAbi } from '@/abi';
import Web3 from 'web3';
import { ethers } from 'ethers';

export const useGridottoCore = () => {
  const { web3, account } = useUPProvider();
  const [contract, setContract] = useState<any>(null);
  const [ethersContract, setEthersContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initContract = async () => {
      if (!web3 || !window.ethereum) return;

      try {
        setLoading(true);
        
        // Web3 contract instance
        const contractInstance = new web3.eth.Contract(
          coreAbi as any,
          CONTRACTS.LUKSO_TESTNET.DIAMOND
        );
        
        // Ethers contract instance for better event handling
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const ethersInstance = new ethers.Contract(
          CONTRACTS.LUKSO_TESTNET.DIAMOND,
          coreAbi,
          signer
        );
        
        setContract(contractInstance);
        setEthersContract(ethersInstance);
        setError(null);
      } catch (err) {
        console.error('Error initializing core contract:', err);
        setError('Failed to initialize contract');
      } finally {
        setLoading(false);
      }
    };

    initContract();
  }, [web3]);

  // Create LYX Draw
  const createLYXDraw = useCallback(async (params: {
    ticketPrice: string;
    maxTickets: number;
    duration: number;
    minParticipants: number;
    platformFee: number;
    initialPrize: string;
  }) => {
    if (!contract || !account) throw new Error('Contract or account not available');
    
    const {
      ticketPrice,
      maxTickets,
      duration,
      minParticipants,
      platformFee,
      initialPrize
    } = params;
    
    const tx = await contract.methods.createLYXDraw(
      ticketPrice,
      maxTickets,
      duration,
      minParticipants,
      platformFee
    ).send({ 
      from: account,
      value: initialPrize 
    });
    
    return tx;
  }, [contract, account]);

  // Create Token Draw (LSP7)
  const createTokenDraw = useCallback(async (params: {
    tokenAddress: string;
    ticketPrice: string;
    maxTickets: number;
    duration: number;
    minParticipants: number;
    platformFee: number;
    initialPrize: string;
  }) => {
    if (!contract || !account) throw new Error('Contract or account not available');
    
    const {
      tokenAddress,
      ticketPrice,
      maxTickets,
      duration,
      minParticipants,
      platformFee,
      initialPrize
    } = params;
    
    // Note: Token approval should be done before calling this
    const tx = await contract.methods.createTokenDraw(
      tokenAddress,
      ticketPrice,
      maxTickets,
      duration,
      minParticipants,
      platformFee,
      initialPrize
    ).send({ from: account });
    
    return tx;
  }, [contract, account]);

  // Create NFT Draw (LSP8)
  const createNFTDraw = useCallback(async (params: {
    nftContract: string;
    nftTokenIds: string[];
    ticketPrice: string;
    maxTickets: number;
    duration: number;
    minParticipants: number;
    platformFee: number;
  }) => {
    if (!contract || !account) throw new Error('Contract or account not available');
    
    const {
      nftContract,
      nftTokenIds,
      ticketPrice,
      maxTickets,
      duration,
      minParticipants,
      platformFee
    } = params;
    
    // Note: NFT authorization should be done before calling this
    const tx = await contract.methods.createNFTDraw(
      nftContract,
      nftTokenIds,
      ticketPrice,
      maxTickets,
      duration,
      minParticipants,
      platformFee
    ).send({ from: account });
    
    return tx;
  }, [contract, account]);

  // Buy tickets
  const buyTickets = useCallback(async (drawId: number, amount: number) => {
    if (!contract || !account) throw new Error('Contract or account not available');
    
    // Get ticket cost
    const totalCost = await contract.methods.getTicketCost(drawId, amount).call();
    
    // Get draw details to check type
    const details = await contract.methods.getDrawDetails(drawId).call();
    
    if (details.drawType === '0' || details.drawType === '2') { 
      // LYX or NFT draw with LYX payment
      return await contract.methods.buyTickets(drawId, amount).send({ 
        from: account,
        value: totalCost 
      });
    } else if (details.drawType === '1') { 
      // Token draw - approval should be done before
      return await contract.methods.buyTickets(drawId, amount).send({ 
        from: account 
      });
    }
  }, [contract, account]);

  // Get draw details
  const getDrawDetails = useCallback(async (drawId: number) => {
    if (!contract) return null;
    
    try {
      const details = await contract.methods.getDrawDetails(drawId).call();
      return details;
    } catch (err) {
      console.error('Error fetching draw details:', err);
      return null;
    }
  }, [contract]);

  // Get ticket cost
  const getTicketCost = useCallback(async (drawId: number, amount: number) => {
    if (!contract) return '0';
    
    try {
      const cost = await contract.methods.getTicketCost(drawId, amount).call();
      return cost;
    } catch (err) {
      console.error('Error fetching ticket cost:', err);
      return '0';
    }
  }, [contract]);

  // Get user tickets
  const getUserTickets = useCallback(async (drawId: number, user: string) => {
    if (!contract) return '0';
    
    try {
      const tickets = await contract.methods.getUserTickets(drawId, user).call();
      return tickets;
    } catch (err) {
      console.error('Error fetching user tickets:', err);
      return '0';
    }
  }, [contract]);

  // Get active draws
  const getActiveDraws = useCallback(async (offset: number = 0, limit: number = 50) => {
    if (!contract) return [];
    
    try {
      const draws = await contract.methods.getActiveDraws(offset, limit).call();
      return draws;
    } catch (err) {
      console.error('Error fetching active draws:', err);
      return [];
    }
  }, [contract]);

  return {
    contract,
    ethersContract,
    loading,
    error,
    createLYXDraw,
    createTokenDraw,
    createNFTDraw,
    buyTickets,
    getDrawDetails,
    getTicketCost,
    getUserTickets,
    getActiveDraws
  };
};