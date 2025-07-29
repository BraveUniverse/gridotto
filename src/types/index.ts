export interface DrawData {
  // Step 1: Draw Type
  drawType: 'LYX' | 'TOKEN' | 'NFT';
  
  // Step 2: Prize Configuration
  prizeAmount?: number; // Optional initial prize for LYX draws
  tokenAddress?: string;
  nftContract?: string;
  tokenIds?: string[];
  
  // Step 3: Draw Settings
  ticketPrice: number;
  duration: number; // in days
  maxTickets: number;
  
  // Step 4: Requirements (optional)
  requirementType: number; // 0 = NONE, 1 = TOKEN_HOLDER, 2 = NFT_HOLDER, 3 = MIN_FOLLOWERS
  requiredToken?: string;
  minTokenAmount?: number;
  minFollowers?: number;
  
  // Advanced settings (all optional)
  winnerCount?: number;
  platformFeePercent?: number; // Platform fee is 5% by default
  minParticipants?: number;
  maxParticipants?: number;
  maxTicketsPerUser?: number;
  
  // Asset selection helpers
  prizeAsset?: string;
  selectedAsset?: any;
  
  // For contract calls
  creatorContribution?: number; // Initial LYX contribution for LYX draws
}