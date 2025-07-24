'use client';

// Compatibility layer for old code
import { useMemo } from 'react';
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

  // Compatibility functions
  const getActiveUserDraws = async (limit?: number) => {
    const draws = await core.getActiveDraws();
    
    // Convert to UserDraw format
    const userDraws = draws.map(draw => ({
      drawId: draw.drawId,
      creator: draw.creator,
      endTime: draw.endTime.toString(),
      prizeType: draw.drawType === 0 ? 'LYX' as const : draw.drawType === 1 ? 'LSP7' as const : 'LSP8' as const,
      prizeAmount: draw.prizePool.toString(),
      ticketPrice: draw.ticketPrice.toString(),
      maxTickets: Number(draw.maxTickets),
      minTickets: Number(draw.minParticipants),
      isActive: !draw.isCompleted && !draw.isCancelled,
      totalTicketsSold: Number(draw.ticketsSold),
      participants: [] // This would need a separate call to get participants
    }));
    
    return userDraws.slice(0, limit || 20);
  };

  const getUserDrawStats = async (drawId: number) => {
    const details = await core.getDrawDetails(drawId);
    if (!details) return null;
    
    return {
      creator: details.creator,
      endTime: Number(details.endTime),
      prizePool: details.prizePool.toString(),
      totalParticipants: Number(details.participantCount),
      totalTicketsSold: Number(details.ticketsSold)
    };
  };

  const getOfficialDrawInfo = async () => {
    const info = await platform.getPlatformDrawsInfo();
    if (!info) return null;
    
    return {
      currentDrawNumber: Number(info.weeklyDrawId),
      nextDrawTime: Number(info.nextMonthlyDraw),
      ticketPrice: Web3.utils.toWei("0.1", "ether") // Default price
    };
  };

  const getContractInfo = async () => {
    const stats = await leaderboard.getPlatformStatistics();
    const officialInfo = await getOfficialDrawInfo();
    
    return {
      totalPrizePool: stats?.totalPrizesDistributed.toString() || '0',
      currentDrawNumber: officialInfo?.currentDrawNumber || 0,
      nextDrawTime: officialInfo?.nextDrawTime || 0,
      ticketPrice: officialInfo?.ticketPrice || '100000000000000000'
    };
  };

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

  const getDrawParticipants = async (drawId: number, offset?: number, limit?: number) => {
    // This would need a new contract method
    return { participants: [], ticketCounts: [] };
  };

  return useMemo(() => ({
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
    
    // Execution functions
    executeUserDraw,
    canExecuteDraw,
    
    // Refund functions
    claimAll,
    
    // Leaderboard functions
    getRecentWinners,
    
    // Platform functions
    getUserCreatedDraws: async (creator: string) => [],
    getAllClaimablePrizes: async (user: string) => ({ totalLYX: '0', hasTokenPrizes: false, hasNFTPrizes: false }),
    getUserDrawExecutorReward: async (drawId: number) => '0',
    getAdvancedDrawInfo: async (drawId: number) => null,
    canUserParticipate: async (drawId: number, user: string) => ({ canParticipate: true, reason: '' }),
    buyTickets: core.buyTickets,
    buyMonthlyTickets: core.buyTickets,
    getDrawParticipants,
    getUserParticipationHistory: async (user: string) => ({ drawIds: [], ticketsBought: [], won: [] }),
    getCurrentDrawInfo: platform.getPlatformDrawsInfo,
    getCurrentDrawPrize: async () => '0',
    getMonthlyPrize: async () => '0',
    getTicketPrice: async () => Web3.utils.toWei("0.1", "ether"),
    getExpiredDrawsWaitingExecution: async () => ({ drawIds: [], endTimes: [], participantCounts: [], minParticipants: [] }),
    forceExecuteDraw: execution.executeDraw,
    refundDraw: async (drawId: number) => {},
    claimRefund: refund.claimRefund,
    getUserDraws: async (userAddress: string) => [],
    getPlatformStats: leaderboard.getPlatformStatistics
  }), [
    // Only include primitive values
    core.loading,
    execution.loading,
    platform.loading,
    refund.loading,
    leaderboard.loading,
    account
  ]);
};