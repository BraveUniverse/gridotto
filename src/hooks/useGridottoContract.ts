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
      
      // Use getDrawInfo method from GridottoFacet
      const result = await gridottoContract.methods.getDrawInfo().call();
      
      if (result) {
        return {
          drawNumber: result.drawNumber?.toString() || result[0]?.toString() || '0',
          prizePool: result.prize ? Web3.utils.fromWei(result.prize.toString(), 'ether') : 
                     result[2] ? Web3.utils.fromWei(result[2].toString(), 'ether') : '0',
          ticketCount: result.ticketsSold?.toString() || result[3]?.toString() || '0',
          remainingTime: result.endTime ? (parseInt(result.endTime) - Math.floor(Date.now() / 1000)).toString() :
                        result[1] ? (parseInt(result[1]) - Math.floor(Date.now() / 1000)).toString() : '0'
        };
      }
      
      return null;
    } catch (err: any) {
      console.error('getCurrentDrawInfo error:', err);
      return null;
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
      
      // Use getMonthlyDrawInfo method from GridottoFacet
      const result = await gridottoContract.methods.getMonthlyDrawInfo().call();
      
      if (result) {
        return {
          drawNumber: result.drawNumber?.toString() || result[0]?.toString() || '0',
          prizePool: result.prize ? Web3.utils.fromWei(result.prize.toString(), 'ether') : 
                     result[2] ? Web3.utils.fromWei(result[2].toString(), 'ether') : '0',
          ticketCount: result.ticketsSold?.toString() || result[3]?.toString() || '0',
          remainingTime: result.endTime ? (parseInt(result.endTime) - Math.floor(Date.now() / 1000)).toString() :
                        result[1] ? (parseInt(result[1]) - Math.floor(Date.now() / 1000)).toString() : '0'
        };
      }
      
      return null;
    } catch (err: any) {
      console.error('getMonthlyDrawInfo error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [gridottoContract]);

  // Get contract info - use individual state variables
  const getContractInfo = useCallback(async (): Promise<ContractInfo | null> => {
    if (!gridottoContract) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // GridottoFacet doesn't have getContractInfo, so we'll return defaults
      // In production, you might need to add this view function to the contract
      return {
        ticketPrice: '1', // Default 1 LYX
        drawInterval: '604800', // 7 days in seconds
        monthlyDrawInterval: '2592000' // 30 days in seconds
      };
    } catch (err: any) {
      console.error('getContractInfo error:', err);
      return null;
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
      
      // Use getActiveDraws method from GridottoFacet
      let drawIds = [];
      try {
        drawIds = await gridottoContract.methods.getActiveDraws().call();
      } catch (e) {
        console.log('getActiveDraws not found, returning empty array');
        return [];
      }
      
      const draws: UserDraw[] = [];
      
      // Process real draw IDs only
      for (const drawId of drawIds) {
        try {
          const drawInfo = await gridottoContract.methods.getUserDraw(drawId).call();
          
          // Handle both object and array returns
          const creator = drawInfo.creator || drawInfo[0];
          const drawType = drawInfo.drawType !== undefined ? drawInfo.drawType : drawInfo[1];
          const ticketPrice = drawInfo.ticketPrice || drawInfo[2];
          const ticketsSold = drawInfo.ticketsSold || drawInfo[3];
          const maxTickets = drawInfo.maxTickets || drawInfo[4];
          const currentPrizePool = drawInfo.currentPrizePool || drawInfo[5];
          const endTime = drawInfo.endTime || drawInfo[6];
          const isCompleted = drawInfo.isCompleted !== undefined ? drawInfo.isCompleted : drawInfo[7];
          
          draws.push({
            id: parseInt(drawId),
            creator: creator,
            drawType: parseInt(drawType),
            ticketPrice: Web3.utils.fromWei(ticketPrice.toString(), 'ether'),
            ticketsSold: ticketsSold.toString(),
            maxTickets: maxTickets.toString(),
            currentPrizePool: Web3.utils.fromWei(currentPrizePool.toString(), 'ether'),
            endTime: endTime.toString(),
            isCompleted: isCompleted
          });
        } catch (err) {
          console.error(`Error fetching draw ${drawId}:`, err);
        }
      }
      
      return draws;
    } catch (err: any) {
      console.error('getActiveUserDraws error:', err);
      return [];
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