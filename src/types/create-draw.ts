export interface DrawData {
  drawType: 'LYX' | 'TOKEN' | 'NFT';
  duration: number;
  ticketPrice: number;
  maxTickets: number;
  requirementType: number;
  requiredToken?: string;
  minTokenAmount?: number;
  
  // Token specific
  tokenAddress?: string;
  prizeAmount?: number;
  tokenSymbol?: string;
  
  // NFT specific
  nftContract?: string;
  tokenIds: string[];
}