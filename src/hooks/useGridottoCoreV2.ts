'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUPProvider } from './useUPProvider';
import { diamondAbi } from '@/abi';
import Web3 from 'web3';
import { CONTRACTS } from '@/config/contracts';
import { sendTransaction } from '@/utils/luksoTransactionHelper';

const DIAMOND_ADDRESS = CONTRACTS.LUKSO_TESTNET.DIAMOND;

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
  executorFeeCollected: bigint; // NEW: Pre-collected executor fee
}

export function useGridottoCoreV2() {
  const { web3, account, isConnected } = useUPProvider();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[useGridottoCoreV2] Initializing...', {
      web3: !!web3,
      account,
      DIAMOND_ADDRESS
    });
    
    if (web3) {
      console.log('[useGridottoCoreV2] Creating contract instance...');
      const coreContract = new web3.eth.Contract(diamondAbi as any, DIAMOND_ADDRESS);
      setContract(coreContract);
      console.log('[useGridottoCoreV2] Contract instance created with diamondAbi');
    } else {
      console.log('[useGridottoCoreV2] No web3 instance available');
      setContract(null);
    }
  }, [web3]);

  // Create LYX Draw
  const createLYXDraw = async (
    ticketPrice: string, // already in Wei
    maxTickets: number,
    duration: number,
    minParticipants: number,
    platformFeePercent: number,
    initialPrize: string = "0" // already in Wei
  ) => {
    if (!contract || !account || !web3) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('[createLYXDraw] Input params:', {
        ticketPrice,
        ticketPriceInLYX: web3.utils.fromWei(ticketPrice, 'ether'),
        maxTickets,
        duration,
        minParticipants,
        platformFeePercent,
        initialPrize,
        initialPrizeInLYX: web3.utils.fromWei(initialPrize, 'ether')
      });
      
      const tx = await sendTransaction(
        contract,
        'createLYXDraw',
        [
          ticketPrice, // Already in Wei, no conversion needed
          maxTickets,
          duration,
          minParticipants,
          platformFeePercent
        ],
        { 
          from: account,
          value: initialPrize // Already in Wei, no conversion needed
        },
        web3,
        account,
        DIAMOND_ADDRESS
      );
      
      // Extract drawId from events
      const event = tx.events?.DrawCreated;
      if (event) {
        return event.returnValues.drawId;
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
    ticketPrice: string, // already in Wei
    maxTickets: number,
    duration: number,
    minParticipants: number,
    platformFeePercent: number,
    initialPrize: string = "0" // Token amount already in smallest unit
  ) => {
    if (!contract || !account || !web3) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('[createTokenDraw] Input params:', {
        tokenAddress,
        ticketPrice,
        ticketPriceInTokens: web3.utils.fromWei(ticketPrice, 'ether'),
        maxTickets,
        duration,
        minParticipants,
        platformFeePercent,
        initialPrize,
        initialPrizeInTokens: web3.utils.fromWei(initialPrize, 'ether')
      });
      
      const tx = await sendTransaction(
        contract,
        'createTokenDraw',
        [
          tokenAddress,
          ticketPrice, // Already in smallest unit, no conversion needed
          maxTickets,
          duration,
          minParticipants,
          platformFeePercent,
          initialPrize // Already in smallest unit, no conversion needed
        ],
        { from: account },
        web3,
        account,
        DIAMOND_ADDRESS
      );
      
      // Extract drawId from events
      const event = tx.events?.DrawCreated;
      if (event) {
        return event.returnValues.drawId;
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
    ticketPrice: string, // already in Wei (LYX)
    duration: number, // duration in seconds
    maxTickets: number,
    requirement: number = 0, // ParticipationRequirement enum
    requiredToken: string = '0x0000000000000000000000000000000000000000',
    minTokenAmount: number = 0
  ) => {
    if (!contract || !account || !web3) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('[createNFTDraw] Input params:', {
        nftContract,
        nftTokenIds,
        ticketPrice,
        ticketPriceInLYX: web3.utils.fromWei(ticketPrice, 'ether'),
        duration,
        maxTickets,
        requirement,
        requiredToken,
        minTokenAmount
      });
      
      // Convert token IDs to bytes32
      const bytes32TokenIds = nftTokenIds.map(id => 
        Web3.utils.padLeft(Web3.utils.toHex(id), 64)
      );
      
      console.log('[createNFTDraw] Converted token IDs:', bytes32TokenIds);
      
      // Note: NFT authorization should be done before this
      const tx = await sendTransaction(
        contract,
        'createNFTDraw',
        [
          nftContract,
          bytes32TokenIds,
          ticketPrice, // Already in Wei
          duration, // Duration in seconds
          maxTickets,
          requirement, // ParticipationRequirement enum
          requiredToken, // Required token address (0x0 if none)
          minTokenAmount // Minimum token amount (0 if none)
        ],
        { from: account },
        web3,
        account,
        DIAMOND_ADDRESS
      );
      
      // Extract drawId from events
      const event = tx.events?.DrawCreated;
      if (event) {
        return event.returnValues.drawId;
      }
      
      return null;
    } catch (err: any) {
      console.error('[createNFTDraw] Error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Buy tickets - LUKSO UP compatible
  const buyTickets = async (drawId: number, amount: number) => {
    if (!contract || !account || !web3) {
      throw new Error('Wallet not connected');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('[buyTickets] Starting with params:', { drawId, amount, account });
      
      // Get draw details to determine payment
      const details = await contract.methods.getDrawDetails(drawId).call();
      console.log('[buyTickets] Draw details:', details);
      console.log('[buyTickets] Draw type:', details.drawType, 'Type of drawType:', typeof details.drawType);
      console.log('[buyTickets] Ticket price:', details.ticketPrice);
      
      // Convert drawType to number for comparison
      const drawTypeNum = Number(details.drawType);
      console.log('[buyTickets] Draw type as number:', drawTypeNum);
      
      // Check if this is a LYX payment draw (types 0, 2, 3, 4)
      const isLYXPayment = drawTypeNum === 0 || drawTypeNum === 2 || drawTypeNum === 3 || drawTypeNum === 4;
      console.log('[buyTickets] Is LYX payment:', isLYXPayment);
      
      const value = isLYXPayment 
        ? (BigInt(details.ticketPrice) * BigInt(amount)).toString()
        : '0';
      
      console.log('[buyTickets] Calculated transaction value:', value);
      console.log('[buyTickets] Value in ETH:', web3.utils.fromWei(value, 'ether'));
      
      // Use the UP-compatible sendTransaction helper
      const tx = await sendTransaction(
        contract,
        'buyTickets',
        [drawId, amount],
        { 
          from: account,
          value: value
        },
        web3,
        account,
        DIAMOND_ADDRESS
      );
      
      console.log('[buyTickets] Transaction completed:', tx);
      return tx;
    } catch (err: any) {
      console.error('[buyTickets] Error occurred:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get draw details
  const getDrawDetails = useCallback(async (drawId: number): Promise<DrawDetails | null> => {
    // Contract'ı her seferinde kontrol et
    if (!web3) {
      console.log('[getDrawDetails] No web3 available');
      return null;
    }
    
    // Contract yoksa yeniden oluştur
    let activeContract = contract;
    if (!activeContract) {
      console.log('[getDrawDetails] Contract not ready, creating new instance...');
      activeContract = new web3.eth.Contract(diamondAbi as any, DIAMOND_ADDRESS);
    }
    
    if (!activeContract) {
      console.log('[getDrawDetails] Failed to create contract');
      return null;
    }
    
    // Validate drawId
    if (!drawId || isNaN(drawId) || drawId <= 0) {
      console.error('[getDrawDetails] Invalid drawId provided:', drawId);
      return null;
    }
    
    try {
      console.log('[getDrawDetails] Fetching details for draw:', drawId);
      const details = await activeContract.methods.getDrawDetails(drawId).call();
      console.log('[getDrawDetails] Raw details:', details);
      
      const result = {
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
        monthlyPoolContribution: details.monthlyPoolContribution,
        executorFeeCollected: details.executorFeeCollected
      };
      
      console.log('[getDrawDetails] Checking field values:');
      console.log('- ticketPrice:', details.ticketPrice, 'type:', typeof details.ticketPrice);
      console.log('- prizePool:', details.prizePool, 'type:', typeof details.prizePool);
      console.log('- executorFeeCollected:', details.executorFeeCollected, 'type:', typeof details.executorFeeCollected);
      
      // Check if draw exists
      if (!details || details.creator === '0x0000000000000000000000000000000000000000') {
        console.log('[getDrawDetails] Draw does not exist');
        return null;
      }
      
      console.log('[getDrawDetails] Processed details for draw #' + drawId + ':', {
        creator: result.creator,
        drawType: result.drawType,
        isCompleted: result.isCompleted,
        isCancelled: result.isCancelled,
        endTime: result.endTime.toString()
      });
      
      return result;
    } catch (err: any) {
      console.error('[getDrawDetails] Error fetching draw details:', err);
      console.error('[getDrawDetails] DrawId was:', drawId);
      return null;
    }
  }, [contract, web3]);

  // Get user draw history
  const getUserDrawHistory = async (user: string): Promise<number[]> => {
    if (!contract) return [];
    
    try {
      const history = await contract.methods.getUserDrawHistory(user).call();
      // Filter out invalid draw IDs
      return history
        .map((id: string) => Number(id))
        .filter((id: number) => !isNaN(id) && id > 0);
    } catch (err: any) {
      console.error('Error fetching user draw history:', err);
      return [];
    }
  };

  // Cancel draw (only creator or admin)
  const cancelDraw = async (drawId: number) => {
    if (!contract || !account) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.methods.cancelDraw(drawId).send({ from: account });
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get next draw ID
  const getNextDrawId = useCallback(async (): Promise<number> => {
    if (!contract) return 0;
    
    try {
      console.log('[getNextDrawId] Calling contract.methods.getNextDrawId()...');
      const nextId = await contract.methods.getNextDrawId().call();
      console.log('[getNextDrawId] Contract returned:', nextId, 'type:', typeof nextId);
      return Number(nextId);
    } catch (err: any) {
      console.error('[getNextDrawId] Error fetching next draw ID:', err);
      return 0;
    }
  }, [contract]);

  // Get active draws
  const getActiveDraws = useCallback(async (): Promise<any[]> => {
    if (!contract) return [];
    
    try {
      const draws: any[] = [];
      const nextDrawId = await getNextDrawId();
      
      // If nextDrawId is 0, no draws have been created yet
      if (nextDrawId === 0) {
        console.log('No draws created yet (nextDrawId is 0)');
        return [];
      }
      
      console.log('[getActiveDraws] nextDrawId:', nextDrawId, 'type:', typeof nextDrawId);
      
      // Convert to number if it's not already
      const nextDrawIdNum = Number(nextDrawId);
      
      // Get ALL draws instead of limiting to last 20
      const startId = 1;
      
      console.log('[getActiveDraws] Fetching ALL draws from', startId, 'to', nextDrawIdNum - 1);
      
      // Batch fetch draw details  
      const promises = [];
      for (let i = startId; i < nextDrawIdNum; i++) {
        promises.push(getDrawDetails(i));
      }
      
      console.log('[getActiveDraws] Created', promises.length, 'promises for draws', startId, 'to', nextDrawIdNum - 1);
      
      const results = await Promise.all(promises);
      
      console.log('[getActiveDraws] Promise results:', results.map((r, i) => `Draw ${i+1}: ${r ? 'OK' : 'NULL'}`));
      
      // Filter active draws
      results.forEach((details, index) => {
        const drawId = startId + index;
        console.log(`[getActiveDraws] Processing draw ${drawId}:`, {
          exists: !!details,
          isCompleted: details?.isCompleted,
          isCancelled: details?.isCancelled,
          endTime: details?.endTime
        });
        
        if (details && !details.isCompleted && !details.isCancelled) {
          // Check if draw is still active (not expired)
          const currentTime = Math.floor(Date.now() / 1000);
          const endTime = Number(details.endTime);
          
          console.log(`[getActiveDraws] Time check for draw ${drawId}: currentTime=${currentTime}, endTime=${endTime}, active=${endTime > currentTime}`);
          
          if (endTime > currentTime) {
            // Safe BigInt to string conversion with fallbacks
            const safeToString = (value: any): string => {
              if (value === null || value === undefined) return "0";
              try {
                return value.toString();
              } catch (error) {
                console.warn('[getActiveDraws] Error converting to string:', value, error);
                return "0";
              }
            };
            
            const safeToNumber = (value: any): number => {
              if (value === null || value === undefined) return 0;
              try {
                return Number(value);
              } catch (error) {
                console.warn('[getActiveDraws] Error converting to number:', value, error);
                return 0;
              }
            };

            const safeFromWei = (value: any): number => {
              try {
                console.log('[safeFromWei] Input value:', value, 'type:', typeof value);
                
                // Extra safety checks
                if (value === null || value === undefined || value === '') {
                  console.log('[safeFromWei] Null/undefined/empty value, returning 0');
                  return 0;
                }
                
                const stringValue = safeToString(value);
                console.log('[safeFromWei] After safeToString:', stringValue);
                
                if (!web3) {
                  console.log('[safeFromWei] No web3 instance, returning 0');
                  return 0;
                }
                
                if (stringValue === "0" || stringValue === "" || stringValue === "null" || stringValue === "undefined") {
                  console.log('[safeFromWei] Zero or invalid string value, returning 0');
                  return 0;
                }
                
                const weiResult = web3.utils.fromWei(stringValue, 'ether');
                console.log('[safeFromWei] FromWei result:', weiResult);
                
                const finalResult = parseFloat(weiResult);
                console.log('[safeFromWei] Final result:', finalResult);
                
                return finalResult;
              } catch (error) {
                console.error('[safeFromWei] Error converting from Wei:', value, error);
                return 0;
              }
            };

            const getDrawTypeName = (drawType: number) => {
              switch (drawType) {
                case DrawType.USER_LYX:
                  return 'User LYX';
                case DrawType.USER_LSP7:
                  return 'User LSP7';
                case DrawType.USER_LSP8:
                  return 'User LSP8';
                case DrawType.PLATFORM_WEEKLY:
                  return 'Platform Weekly';
                case DrawType.PLATFORM_MONTHLY:
                  return 'Platform Monthly';
                default:
                  return 'Unknown';
              }
            };
            
            // Convert BigInt values to strings/numbers for safe serialization
            draws.push({ 
              drawId: startId + index,
              creator: details.creator || '',
              drawType: safeToNumber(details.drawType),
              drawTypeName: getDrawTypeName(safeToNumber(details.drawType)),
              tokenAddress: details.tokenAddress || '',
              ticketPrice: safeToString(details.ticketPrice),
              ticketPrice_LYX: safeFromWei(safeToString(details.ticketPrice)),
              maxTickets: safeToNumber(details.maxTickets),
              ticketsSold: safeToNumber(details.ticketsSold),
              prizePool: safeToString(details.prizePool),
              prizePool_LYX: safeFromWei(safeToString(details.prizePool)),
              startTime: safeToNumber(details.startTime),
              endTime: safeToNumber(details.endTime),
              timeRemaining: safeToNumber(details.endTime) - Math.floor(Date.now() / 1000),
              minParticipants: safeToNumber(details.minParticipants),
              platformFeePercent: safeToNumber(details.platformFeePercent),
              isCompleted: details.isCompleted || false,
              isCancelled: details.isCancelled || false,
              isActive: true, // Since we filter for active draws
              participantCount: safeToNumber(details.participantCount),
              monthlyPoolContribution: safeToString(details.monthlyPoolContribution),
              executorFee_LYX: safeFromWei(safeToString(details.executorFeeCollected || '0')),
              // NFT specific fields - Will be fetched separately for NFT draws
              nftContract: safeToNumber(details.drawType) === 2 ? '' : undefined, // Will be updated via getDrawNFTDetails
              tokenIds: safeToNumber(details.drawType) === 2 ? [] : undefined, // Will be updated via getDrawNFTDetails
              isPlatformDraw: false // Will be updated by ActiveDrawsSection logic
            });
          }
        }
      });
      
      console.log('[getActiveDraws] Found', draws.length, 'active draws');
      console.log('[getActiveDraws] Draw types:', draws.map(d => `Draw ${d.drawId}: type ${d.drawType}`));
      
      // Fetch NFT details for NFT draws
      for (const draw of draws) {
        console.log(`[getActiveDraws] Checking draw ${draw.drawId}, type: ${draw.drawType}`);
        if (draw.drawType === 2) { // USER_LSP8
          try {
            console.log(`[getActiveDraws] Fetching NFT details for draw ${draw.drawId}`);
            const nftDetails = await contract.methods.getDrawNFTDetails(draw.drawId).call();
            
            // Update draw with NFT details
            draw.nftContract = nftDetails.nftContract;
            draw.tokenIds = Array.isArray(nftDetails.tokenIds) ? nftDetails.tokenIds : [nftDetails.tokenIds];
            
            console.log(`[getActiveDraws] NFT details for draw ${draw.drawId}:`, {
              nftContract: draw.nftContract,
              tokenIds: draw.tokenIds
            });
          } catch (error) {
            console.error(`[getActiveDraws] Failed to fetch NFT details for draw ${draw.drawId}:`, error);
            // Keep empty values if fetch fails
          }
        }
      }
      
      return draws;
    } catch (err: any) {
      console.error('Error fetching active draws:', err);
      return [];
    }
  }, [contract, getNextDrawId, getDrawDetails, web3]);

  // Get draw participants
  const getDrawParticipants = useCallback(async (drawId: number): Promise<any[]> => {
    // Contract'ı her seferinde kontrol et
    if (!web3) {
      console.log('[getDrawParticipants] No web3 available');
      return [];
    }
    
    // Contract yoksa yeniden oluştur
    let activeContract = contract;
    if (!activeContract) {
      console.log('[getDrawParticipants] Contract not ready, creating new instance...');
      activeContract = new web3.eth.Contract(diamondAbi as any, DIAMOND_ADDRESS);
    }
    
    if (!activeContract) {
      console.log('[getDrawParticipants] Failed to create contract');
      return [];
    }
    
    try {
      console.log('[getDrawParticipants] Getting participants for draw:', drawId);
      
      // Try to get participants
      const participants = await activeContract.methods.getDrawParticipants(drawId).call();
      
      // Get ticket counts for each participant
      const participantsWithDetails = await Promise.all(
        participants.map(async (address: string) => {
          try {
            const ticketCount = await activeContract.methods.getUserTicketCount(drawId, address).call();
            return {
              address,
              ticketCount: Number(ticketCount),
              timestamp: Date.now() / 1000
            };
          } catch (err) {
            console.error(`Error getting ticket count for ${address}:`, err);
            return {
              address,
              ticketCount: 1,
              timestamp: Date.now() / 1000
            };
          }
        })
      );
      
      return participantsWithDetails.sort((a, b) => b.ticketCount - a.ticketCount);
    } catch (err: any) {
      console.error('[getDrawParticipants] Error:', err);
      return [];
    }
  }, [contract, web3]);

  // Claim prize for a specific draw
  const claimPrize = useCallback(async (drawId: number) => {
    if (!contract || !account || !web3) throw new Error('Wallet not connected');
    
    try {
      console.log('[claimPrize] Claiming prize for draw:', drawId);
      
      const result = await sendTransaction(
        contract,
        'claimPrize',
        [drawId],
        {},
        web3,
        account,
        DIAMOND_ADDRESS
      );
      
      console.log('[claimPrize] Prize claimed:', result);
      return result;
    } catch (err: any) {
      console.error('[claimPrize] Error:', err);
      throw err;
    }
  }, [contract, account, web3]);

  // Claim executor fees
  const claimExecutorFees = useCallback(async () => {
    if (!contract || !account || !web3) throw new Error('Wallet not connected');
    
    try {
      console.log('[claimExecutorFees] Claiming executor fees');
      
      const result = await sendTransaction(
        contract,
        'claimExecutorFees',
        [],
        {},
        web3,
        account,
        DIAMOND_ADDRESS
      );
      
      console.log('[claimExecutorFees] Fees claimed:', result);
      return result;
    } catch (err: any) {
      console.error('[claimExecutorFees] Error:', err);
      throw err;
    }
  }, [contract, account, web3]);

  // Get unclaimed prizes for a user
  const getUnclaimedPrizes = useCallback(async (userAddress: string): Promise<any[]> => {
    if (!web3) {
      console.log('[getUnclaimedPrizes] No web3 available');
      return [];
    }
    
    let activeContract = contract;
    if (!activeContract) {
      console.log('[getUnclaimedPrizes] Contract not ready, creating new instance...');
      activeContract = new web3.eth.Contract(diamondAbi as any, DIAMOND_ADDRESS);
    }
    
    if (!activeContract) {
      console.log('[getUnclaimedPrizes] Failed to create contract');
      return [];
    }
    
    try {
      console.log('[getUnclaimedPrizes] Getting unclaimed prizes for:', userAddress);
      const prizes = await activeContract.methods.getUnclaimedPrizes(userAddress).call();
      console.log('[getUnclaimedPrizes] Raw prizes:', prizes);
      
      // Convert to array of draw IDs with prize info
      const unclaimedPrizes = [];
      if (prizes && prizes.drawIds && prizes.amounts) {
        for (let i = 0; i < prizes.drawIds.length; i++) {
          unclaimedPrizes.push({
            drawId: Number(prizes.drawIds[i]),
            amount: prizes.amounts[i],
            isNFT: prizes.isNFT ? prizes.isNFT[i] : false
          });
        }
      }
      
      return unclaimedPrizes;
    } catch (err: any) {
      console.error('[getUnclaimedPrizes] Error:', err);
      return [];
    }
  }, [contract, web3]);

  // Get claimable executor fees
  const getClaimableExecutorFees = useCallback(async (executorAddress: string): Promise<string> => {
    if (!web3) {
      console.log('[getClaimableExecutorFees] No web3 available');
      return '0';
    }
    
    let activeContract = contract;
    if (!activeContract) {
      console.log('[getClaimableExecutorFees] Contract not ready, creating new instance...');
      activeContract = new web3.eth.Contract(diamondAbi as any, DIAMOND_ADDRESS);
    }
    
    if (!activeContract) {
      console.log('[getClaimableExecutorFees] Failed to create contract');
      return '0';
    }
    
    try {
      console.log('[getClaimableExecutorFees] Getting claimable fees for:', executorAddress);
      const fees = await activeContract.methods.getClaimableExecutorFees(executorAddress).call();
      console.log('[getClaimableExecutorFees] Claimable fees:', fees);
      return fees || '0';
    } catch (err: any) {
      console.error('[getClaimableExecutorFees] Error:', err);
      return '0';
    }
  }, [contract, web3]);

  return {
    contract,
    loading,
    error,
    // Draw creation functions
    createLYXDraw,
    createTokenDraw,
    createNFTDraw,
    // Core functions
    buyTickets,
    getActiveDraws,
    getDrawDetails,
    getUserDrawHistory,
    getDrawParticipants,
    // Claim functions
    claimPrize,
    claimExecutorFees,
    getUnclaimedPrizes,
    getClaimableExecutorFees
  };
}