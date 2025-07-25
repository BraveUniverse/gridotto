import { DrawType } from '@/hooks/useGridottoCoreV2';
import Web3 from 'web3';

export interface FeeBreakdown {
  totalCost: string;
  prizePool: string;
  platformFee: string;
  executorFee: string;
  monthlyPool: string;
  creatorAmount?: string; // For NFT draws
  prizePoolPercent: number;
  platformFeePercent: number;
  executorFeePercent: number;
  monthlyPoolPercent: number;
}

export function calculateFeeBreakdown(
  ticketPrice: string | bigint,
  ticketCount: number,
  drawType: DrawType
): FeeBreakdown {
  const web3 = new Web3();
  const ticketPriceWei = typeof ticketPrice === 'string' ? ticketPrice : ticketPrice.toString();
  const ticketPriceBigInt = BigInt(ticketPriceWei);
  const ticketCountBigInt = BigInt(ticketCount);
  const totalCostWei = ticketPriceBigInt * ticketCountBigInt;
  
  let platformFeePercent = 0;
  let executorFeePercent = 0;
  let monthlyPoolPercent = 0;
  
  switch (drawType) {
    case DrawType.PLATFORM_WEEKLY:
      platformFeePercent = 5;
      executorFeePercent = 5;
      monthlyPoolPercent = 20;
      break;
    case DrawType.PLATFORM_MONTHLY:
      platformFeePercent = 5;
      executorFeePercent = 5;
      monthlyPoolPercent = 0;
      break;
    case DrawType.USER_LYX:
      platformFeePercent = 5;
      executorFeePercent = 5;
      monthlyPoolPercent = 2;
      break;
    case DrawType.USER_LSP7:
    case DrawType.USER_LSP8:
      platformFeePercent = 5;
      executorFeePercent = 5;
      monthlyPoolPercent = 0;
      break;
  }
  
  const totalFeePercent = platformFeePercent + executorFeePercent + monthlyPoolPercent;
  const prizePoolPercent = 100 - totalFeePercent;
  
  // Calculate amounts
  const platformFeeWei = (totalCostWei * BigInt(platformFeePercent)) / BigInt(100);
  const executorFeeWei = (totalCostWei * BigInt(executorFeePercent)) / BigInt(100);
  const monthlyPoolWei = (totalCostWei * BigInt(monthlyPoolPercent)) / BigInt(100);
  const prizePoolWei = totalCostWei - platformFeeWei - executorFeeWei - monthlyPoolWei;
  
  const result: FeeBreakdown = {
    totalCost: web3.utils.fromWei(totalCostWei.toString(), 'ether'),
    prizePool: web3.utils.fromWei(prizePoolWei.toString(), 'ether'),
    platformFee: web3.utils.fromWei(platformFeeWei.toString(), 'ether'),
    executorFee: web3.utils.fromWei(executorFeeWei.toString(), 'ether'),
    monthlyPool: web3.utils.fromWei(monthlyPoolWei.toString(), 'ether'),
    prizePoolPercent,
    platformFeePercent,
    executorFeePercent,
    monthlyPoolPercent
  };
  
  // For NFT draws, creator gets the prize pool amount
  if (drawType === DrawType.USER_LSP8) {
    result.creatorAmount = result.prizePool;
  }
  
  return result;
}

export function getDrawTypeName(drawType: DrawType): string {
  switch (drawType) {
    case DrawType.PLATFORM_WEEKLY:
      return 'Weekly Platform Draw';
    case DrawType.PLATFORM_MONTHLY:
      return 'Monthly Platform Draw';
    case DrawType.USER_LYX:
      return 'User LYX Draw';
    case DrawType.USER_LSP7:
      return 'User Token Draw';
    case DrawType.USER_LSP8:
      return 'User NFT Draw';
    default:
      return 'Unknown Draw Type';
  }
}