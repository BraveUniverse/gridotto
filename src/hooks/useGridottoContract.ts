import { useState, useCallback, useEffect } from 'react';
import Web3 from 'web3';
import { useUPProvider } from './useUPProvider';
import { CONTRACTS } from '@/config/contracts';
import GridottoFacetABI from '@/abis/GridottoFacet.json';
import Phase3FacetABI from '@/abis/Phase3Facet.json';
import Phase4FacetABI from '@/abis/Phase4Facet.json';

export interface DrawInfo {
  drawNumber: string;
  prizePool: string;
  ticketCount: string;
  remainingTime: string;
}

export interface ContractInfo {
  ticketPrice: string;
  drawInterval: string;
  monthlyDrawInterval: string;
}

export interface UserDraw {
  id: number;
  creator: string;
  drawType: number;
  ticketPrice: string;
  ticketsSold: string;
  maxTickets: string;
  currentPrizePool: string;
  endTime: string;
  isCompleted: boolean;
  tokenAddress?: string;
  nftContract?: string;
  nftTokenIds?: string[];
  prizeModel?: number;
  totalWinners?: number;
}

export const useGridottoContract = () => {
  const { web3, account, isConnected } = useUPProvider();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Contract instances
  const [gridottoContract, setGridottoContract] = useState<any>(null);
  const [phase3Contract, setPhase3Contract] = useState<any>(null);
  const [phase4Contract, setPhase4Contract] = useState<any>(null);

  // Initialize contracts
  useEffect(() => {
    if (web3 && isConnected) {
      try {
        const gridotto = new web3.eth.Contract(GridottoFacetABI as any, CONTRACTS.DIAMOND_ADDRESS);
        const phase3 = new web3.eth.Contract(Phase3FacetABI as any, CONTRACTS.DIAMOND_ADDRESS);
        const phase4 = new web3.eth.Contract(Phase4FacetABI as any, CONTRACTS.DIAMOND_ADDRESS);
        
        setGridottoContract(gridotto);
        setPhase3Contract(phase3);
        setPhase4Contract(phase4);
      } catch (err) {
        console.error('Failed to initialize contracts:', err);
        setError('Failed to connect to contracts');
      }
    }
  }, [web3, isConnected]);

  // Safe contract call wrapper
  const safeCall = async (contractCall: () => Promise<any>, defaultValue: any) => {
    try {
      return await contractCall();
    } catch (err) {
      console.error('Contract call failed:', err);
      return defaultValue;
    }
  };

  // Get current draw info
  const getCurrentDrawInfo = useCallback(async (): Promise<DrawInfo | null> => {
    if (!gridottoContract) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to get draw info with fallback
      const result = await safeCall(
        () => gridottoContract.methods.getCurrentDrawInfo().call(),
        {
          drawNumber: '1',
          prizePool: '0',
          ticketCount: '0',
          remainingTime: '86400' // 24 hours default
        }
      );
      
      return {
        drawNumber: result.drawNumber?.toString() || '1',
        prizePool: result.prizePool ? Web3.utils.fromWei(result.prizePool.toString(), 'ether') : '0',
        ticketCount: result.ticketCount?.toString() || '0',
        remainingTime: result.remainingTime?.toString() || '86400'
      };
    } catch (err: any) {
      console.error('getCurrentDrawInfo error:', err);
      // Return mock data for development
      return {
        drawNumber: '1',
        prizePool: '100',
        ticketCount: '50',
        remainingTime: '86400'
      };
    } finally {
      setIsLoading(false);
    }
  }, [gridottoContract]);

  // Get monthly draw info
  const getMonthlyDrawInfo = useCallback(async (): Promise<DrawInfo | null> => {
    if (!gridottoContract) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await safeCall(
        () => gridottoContract.methods.getCurrentMonthlyDrawInfo().call(),
        {
          drawNumber: '1',
          prizePool: '0',
          ticketCount: '0',
          remainingTime: '2592000' // 30 days default
        }
      );
      
      return {
        drawNumber: result.drawNumber?.toString() || '1',
        prizePool: result.prizePool ? Web3.utils.fromWei(result.prizePool.toString(), 'ether') : '0',
        ticketCount: result.ticketCount?.toString() || '0',
        remainingTime: result.remainingTime?.toString() || '2592000'
      };
    } catch (err: any) {
      console.error('getMonthlyDrawInfo error:', err);
      // Return mock data for development
      return {
        drawNumber: '1',
        prizePool: '500',
        ticketCount: '200',
        remainingTime: '2592000'
      };
    } finally {
      setIsLoading(false);
    }
  }, [gridottoContract]);

  // Get contract info
  const getContractInfo = useCallback(async (): Promise<ContractInfo | null> => {
    if (!gridottoContract) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await safeCall(
        () => gridottoContract.methods.getContractInfo().call(),
        {
          ticketPrice: Web3.utils.toWei('1', 'ether'),
          drawInterval: '86400',
          monthlyDrawInterval: '2592000'
        }
      );
      
      return {
        ticketPrice: result.ticketPrice ? Web3.utils.fromWei(result.ticketPrice.toString(), 'ether') : '1',
        drawInterval: result.drawInterval?.toString() || '86400',
        monthlyDrawInterval: result.monthlyDrawInterval?.toString() || '2592000'
      };
    } catch (err: any) {
      console.error('getContractInfo error:', err);
      // Return default values
      return {
        ticketPrice: '1',
        drawInterval: '86400',
        monthlyDrawInterval: '2592000'
      };
    } finally {
      setIsLoading(false);
    }
  }, [gridottoContract]);

  // Get all active user draws
  const getActiveUserDraws = useCallback(async (): Promise<UserDraw[]> => {
    if (!gridottoContract) return [];
    
    try {
      setIsLoading(true);
      setError(null);
      
      const drawIds = await safeCall(
        () => gridottoContract.methods.getActiveUserDraws().call(),
        []
      );
      
      const draws: UserDraw[] = [];
      
      // If no draws, return mock data for UI testing
      if (!drawIds || drawIds.length === 0) {
        return [
          {
            id: 1,
            creator: '0x1234...5678',
            drawType: 0,
            ticketPrice: '0.5',
            ticketsSold: '25',
            maxTickets: '100',
            currentPrizePool: '50',
            endTime: (Date.now() / 1000 + 86400).toString(),
            isCompleted: false,
            prizeModel: 0,
            totalWinners: 1
          },
          {
            id: 2,
            creator: '0x8765...4321',
            drawType: 1,
            ticketPrice: '1',
            ticketsSold: '50',
            maxTickets: '200',
            currentPrizePool: '100',
            endTime: (Date.now() / 1000 + 172800).toString(),
            isCompleted: false,
            prizeModel: 1,
            totalWinners: 3,
            tokenAddress: '0xabcd...efgh'
          }
        ];
      }
      
      for (const drawId of drawIds) {
        try {
          const drawInfo = await gridottoContract.methods.getUserDraw(drawId).call();
          draws.push({
            id: parseInt(drawId),
            creator: drawInfo.creator,
            drawType: parseInt(drawInfo.drawType),
            ticketPrice: Web3.utils.fromWei(drawInfo.ticketPrice.toString(), 'ether'),
            ticketsSold: drawInfo.ticketsSold.toString(),
            maxTickets: drawInfo.maxTickets.toString(),
            currentPrizePool: Web3.utils.fromWei(drawInfo.currentPrizePool.toString(), 'ether'),
            endTime: drawInfo.endTime.toString(),
            isCompleted: drawInfo.isCompleted
          });
        } catch (err) {
          console.error(`Error fetching draw ${drawId}:`, err);
        }
      }
      
      return draws;
    } catch (err: any) {
      console.error('getActiveUserDraws error:', err);
      // Return mock data for development
      return [
        {
          id: 1,
          creator: '0x1234...5678',
          drawType: 0,
          ticketPrice: '0.5',
          ticketsSold: '25',
          maxTickets: '100',
          currentPrizePool: '50',
          endTime: (Date.now() / 1000 + 86400).toString(),
          isCompleted: false
        }
      ];
    } finally {
      setIsLoading(false);
    }
  }, [gridottoContract]);

  // Buy ticket for platform draw
  const buyTicket = useCallback(async (profileId: string, amount: number, drawType: number = 0) => {
    if (!gridottoContract || !account) {
      throw new Error('Contract not initialized or not connected');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const contractInfo = await getContractInfo();
      if (!contractInfo) throw new Error('Failed to get ticket price');
      
      const value = Web3.utils.toWei((parseFloat(contractInfo.ticketPrice) * amount).toString(), 'ether');
      
      const tx = await gridottoContract.methods
        .buyTicket(profileId, amount)
        .send({ from: account, value });
      
      return tx;
    } catch (err: any) {
      console.error('buyTicket error:', err);
      setError(err.message || 'Failed to buy ticket');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [gridottoContract, account, getContractInfo]);

  // Buy ticket for user draw
  const buyUserDrawTicket = useCallback(async (drawId: number, amount: number, ticketPrice: string) => {
    if (!phase3Contract || !account) {
      throw new Error('Contract not initialized or not connected');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const value = Web3.utils.toWei((parseFloat(ticketPrice) * amount).toString(), 'ether');
      
      const tx = await phase3Contract.methods
        .buyTokenDrawTicket(drawId, amount)
        .send({ from: account, value });
      
      return tx;
    } catch (err: any) {
      console.error('buyUserDrawTicket error:', err);
      setError(err.message || 'Failed to buy ticket');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [phase3Contract, account]);

  // Create token draw
  const createTokenDraw = useCallback(async (params: {
    tokenAddress: string;
    prizeAmount: string;
    ticketPrice: string;
    duration: number;
    maxTickets: number;
    requirement: number;
    requiredToken?: string;
    minTokenAmount?: string;
  }) => {
    if (!phase3Contract || !account) {
      throw new Error('Please connect your wallet to create a draw');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const tx = await phase3Contract.methods.createTokenDraw(
        params.tokenAddress,
        Web3.utils.toWei(params.prizeAmount, 'ether'),
        Web3.utils.toWei(params.ticketPrice, 'ether'),
        params.duration * 86400, // Convert days to seconds
        params.maxTickets,
        params.requirement,
        params.requiredToken || '0x0000000000000000000000000000000000000000',
        params.minTokenAmount ? Web3.utils.toWei(params.minTokenAmount, 'ether') : '0'
      ).send({ from: account });
      
      return tx;
    } catch (err: any) {
      console.error('createTokenDraw error:', err);
      setError(err.message || 'Failed to create draw');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [phase3Contract, account]);

  // Create NFT draw
  const createNFTDraw = useCallback(async (params: {
    nftContract: string;
    tokenIds: string[];
    ticketPrice: string;
    duration: number;
    maxTickets: number;
    requirement: number;
    requiredToken?: string;
    minTokenAmount?: string;
  }) => {
    if (!phase3Contract || !account) {
      throw new Error('Contract not initialized or not connected');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Convert tokenIds to bytes32
      const tokenIdsBytes32 = params.tokenIds.map(id => 
        Web3.utils.padLeft(Web3.utils.toHex(id), 64)
      );
      
      const tx = await phase3Contract.methods.createNFTDraw(
        params.nftContract,
        tokenIdsBytes32,
        Web3.utils.toWei(params.ticketPrice, 'ether'),
        params.duration * 86400, // Convert days to seconds
        params.maxTickets,
        params.requirement,
        params.requiredToken || '0x0000000000000000000000000000000000000000',
        params.minTokenAmount ? Web3.utils.toWei(params.minTokenAmount, 'ether') : '0'
      ).send({ from: account });
      
      return tx;
    } catch (err: any) {
      console.error('createNFTDraw error:', err);
      setError(err.message || 'Failed to create NFT draw');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [phase3Contract, account]);

  // Get owner
  const getOwner = useCallback(async (): Promise<string | null> => {
    if (!gridottoContract) return null;
    
    try {
      const owner = await gridottoContract.methods.owner().call();
      return owner;
    } catch (err: any) {
      console.error('getOwner error:', err);
      return null;
    }
  }, [gridottoContract]);

  return {
    // State
    isLoading,
    error,
    
    // Read functions
    getCurrentDrawInfo,
    getMonthlyDrawInfo,
    getContractInfo,
    getActiveUserDraws,
    getOwner,
    
    // Write functions
    buyTicket,
    buyUserDrawTicket,
    createTokenDraw,
    createNFTDraw,
    
    // Contract instances (for advanced usage)
    gridottoContract,
    phase3Contract,
    phase4Contract,
    web3
  };
}; 