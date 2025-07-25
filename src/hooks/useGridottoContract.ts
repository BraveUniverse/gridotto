'use client';

// Compatibility layer for old code
import { useCallback } from 'react';
import { useGridottoCoreV2 } from './useGridottoCoreV2';
import { useGridottoExecutionV2 } from './useGridottoExecutionV2';
import { useGridottoPlatformDraws } from './useGridottoPlatformDraws';
import { useGridottoRefund } from './useGridottoRefund';
import { useGridottoLeaderboard } from './useGridottoLeaderboard';
import { useUPProvider } from './useUPProvider';
import Web3 from 'web3';

export const useGridottoContract = () => {
  const { account } = useUPProvider();
  const core = useGridottoCoreV2();
  const execution = useGridottoExecutionV2();
  const platform = useGridottoPlatformDraws();
  const refund = useGridottoRefund();
  const leaderboard = useGridottoLeaderboard();

  // Compatibility functions with useCallback
  const getActiveUserDraws = useCallback(async (limit?: number) => {
    const draws = await core.getActiveDraws();
    return draws.slice(0, limit || 20);
  }, [core.getActiveDraws]);

  const getUserDrawStats = useCallback(async (drawId: number) => {
    const details = await core.getDrawDetails(drawId);
    if (!details) return null;
    
    return {
      creator: details.creator,
      endTime: Number(details.endTime),
      prizePool: details.prizePool.toString(),
      totalParticipants: Number(details.participantCount),
      totalTicketsSold: Number(details.ticketsSold)
    };
  }, [core.getDrawDetails]);

  const getOfficialDrawInfo = useCallback(async () => {
    console.log('[getOfficialDrawInfo] Starting...');
    const info = await platform.getPlatformDrawsInfo();
    
    if (!info) {
      console.log('[getOfficialDrawInfo] No info received from platform');
      return null;
    }
    
    // Custom replacer for BigInt values
    const bigIntReplacer = (key: string, value: any) => {
      return typeof value === 'bigint' ? value.toString() + 'n' : value;
    };
    
    console.log('[getOfficialDrawInfo] Platform info received:', JSON.stringify(info, bigIntReplacer, 2));
    
    const result = {
      currentDrawNumber: Number(info.weeklyDrawId),
      nextDrawTime: Number(info.weeklyEndTime), // Use weeklyEndTime instead of non-existent field
      ticketPrice: Web3.utils.toWei("0.25", "ether") // Weekly draw ticket price is 0.25 LYX
    };
    
    console.log('[getOfficialDrawInfo] Final result:', JSON.stringify(result, bigIntReplacer, 2));
    return result;
  }, [platform.getPlatformDrawsInfo]);

  const getContractInfo = useCallback(async () => {
    const stats = await leaderboard.getPlatformStatistics();
    const officialInfo = await getOfficialDrawInfo();
    
    return {
      totalPrizePool: stats?.totalPrizesDistributed.toString() || '0',
      currentDrawNumber: officialInfo?.currentDrawNumber || 0,
      nextDrawTime: officialInfo?.nextDrawTime || 0,
      ticketPrice: officialInfo?.ticketPrice || '100000000000000000'
    };
  }, [leaderboard.getPlatformStatistics, getOfficialDrawInfo]);

  const createDraw = async (params: any) => {
    if (params.drawType === 'LYX') {
      return await core.createLYXDraw(
        params.ticketPrice,
        params.maxTickets || 100,
        params.duration,
        params.minParticipants || 1,
        params.creatorFeePercent || 500,
        params.initialPrize || "0"
      );
    } else if (params.drawType === 'TOKEN') {
      return await core.createTokenDraw(
        params.tokenAddress!,
        params.ticketPrice,
        params.maxTickets || 100,
        params.duration,
        params.minParticipants || 1,
        params.creatorFeePercent || 500,
        params.initialPrize || "0"
      );
    } else if (params.drawType === 'NFT') {
      return await core.createNFTDraw(
        params.nftContract!,
        params.nftTokenIds!,
        params.ticketPrice,
        params.maxTickets || 100,
        params.duration,
        params.minParticipants || 1,
        params.creatorFeePercent || 500
      );
    }
  };

  const purchaseTickets = async (drawId: number, ticketCount: number, ticketPrice: string) => {
    return await core.buyTickets(drawId, ticketCount);
  };

  const executeUserDraw = async (drawId: number) => {
    return await execution.executeDraw(drawId);
  };

  const claimAll = async () => {
    // Get user's claimable draws
    const history = await core.getUserDrawHistory(account!);
    const claimableDraws = [];
    
    for (const drawId of history) {
      const canClaim = await refund.canClaimPrize(drawId, account!);
      if (canClaim.canClaim) {
        claimableDraws.push(drawId);
      }
    }
    
    if (claimableDraws.length > 0) {
      return await refund.batchClaimPrizes(claimableDraws);
    }
  };

  const getRecentWinners = async (limit?: number) => {
    const winners = await leaderboard.getTopWinners(limit || 10);
    return winners.map(w => ({
      winner: w.player,
      prize: w.totalWinnings.toString(),
      drawId: 0, // Not available in new structure
      timestamp: Number(w.lastWinTime)
    }));
  };

  const getUserDraw = async (drawId: number) => {
    const details = await core.getDrawDetails(drawId);
    if (!details) return null;
    
    return {
      creator: details.creator,
      drawType: details.drawType,
      startTime: Number(details.startTime),
      endTime: Number(details.endTime),
      ticketPrice: details.ticketPrice.toString(),
      maxTickets: Number(details.maxTickets),
      ticketsSold: Number(details.ticketsSold),
      currentPrizePool: details.prizePool.toString(),
      isCompleted: details.isCompleted,
      isExecuted: details.isCompleted,
      requirement: 0,
      requiredToken: details.tokenAddress,
      minTokenAmount: '0'
    };
  };

  const getDrawInfo = async (drawId: number) => {
    const details = await core.getDrawDetails(drawId);
    if (!details) return null;
    
    return {
      drawId,
      creator: details.creator,
      endTime: Number(details.endTime),
      prizeType: details.drawType === 0 ? 'LYX' : details.drawType === 1 ? 'LSP7' : 'LSP8',
      prizeAmount: details.prizePool.toString(),
      ticketPrice: details.ticketPrice.toString(),
      maxTickets: Number(details.maxTickets),
      minTickets: Number(details.minParticipants),
      isActive: !details.isCompleted && !details.isCancelled,
      totalTicketsSold: Number(details.ticketsSold),
      participants: []
    };
  };

  const canExecuteDraw = async (drawId: number) => {
    return await execution.canExecuteDraw(drawId);
  };

  return {
    contract: core.contract,
    loading: core.loading || execution.loading || platform.loading || refund.loading || leaderboard.loading,
    error: core.error || execution.error || platform.error || refund.error || leaderboard.error,
    
    // Core functions
    getActiveUserDraws,
    getUserDrawStats,
    getOfficialDrawInfo,
    getContractInfo,
    createDraw,
    purchaseTickets,
    getUserDraw,
    getDrawInfo,
    getDrawDetails: core.getDrawDetails,
    buyTickets: core.buyTickets,
    getDrawParticipants: core.getDrawParticipants,
    
    // Claim functions
    claimPrize: core.claimPrize,
    claimExecutorFees: core.claimExecutorFees,
    getUnclaimedPrizes: core.getUnclaimedPrizes,
    getClaimableExecutorFees: core.getClaimableExecutorFees,
    
    // Execution functions
    executeUserDraw,
    canExecuteDraw,
    
    // Refund functions
    claimAll,
    
    // Leaderboard functions
    getRecentWinners,
    
    // Platform functions
    getCurrentDrawInfo: platform.getPlatformDrawsInfo,
    
    // Mock functions (TODO: Implement these when contract supports them)
    getDrawHistory: async (user: string, offset?: number, limit?: number) => ({ draws: [], total: 0 }),
    getUserStats: async (user: string) => ({ totalDrawsCreated: 0, totalTicketsBought: 0, totalWins: 0, totalAmountWon: '0' }),
    getTicketPrice: async () => {
      const price = Web3.utils.toWei("0.1", "ether");
      console.log('[getTicketPrice] Called - returning:', price);
      return price;
    },
    getExpiredDrawsWaitingExecution: async () => ({ drawIds: [], endTimes: [], participantCounts: [], minParticipants: [] }),
    forceExecuteDraw: execution.executeDraw,
    refundDraw: async (drawId: number) => {},
    claimRefund: refund.claimRefund,
    getUserDraws: async (userAddress: string) => [],
    getPlatformStats: leaderboard.getPlatformStatistics
  };
};