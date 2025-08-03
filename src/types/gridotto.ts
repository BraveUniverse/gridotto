export interface UserDraw {
  drawId: number;
  creator: string;
  endTime: string;
  prizeType: 'LYX' | 'LSP7' | 'LSP8';
  prizeAmount: string;
  ticketPrice: string;
  maxTickets: number;
  minTickets: number;
  isActive: boolean;
  totalTicketsSold: number;
  participants: string[];
  // NFT specific fields
  prizeAddress?: string; // Contract address for LSP7/LSP8
  tokenIds?: string[]; // Token IDs for LSP8 NFTs
}

export interface DrawInfo {
  creator: string;
  endTime: string;
  prizePool: string;
  totalParticipants: string;
  totalTicketsSold: string;
}

export interface ContractInfo {
  totalPrizePool: string;
  currentDrawNumber: number;
  nextDrawTime: number;
  ticketPrice: string;
}

export interface PlatformStats {
  totalDraws: number;
  activeDraws: number;
  totalPrizePool: string;
  totalParticipants: number;
  averageTicketPrice: string;
}