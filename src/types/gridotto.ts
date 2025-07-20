export interface UserDraw {
  id: number;
  creator: string;
  drawType: number; // 0: LYX, 1: LSP7, 2: LSP8
  ticketPrice: string;
  ticketsSold: string;
  maxTickets: string;
  currentPrizePool: string;
  endTime: string;
  isCompleted: boolean;
  prizeModel?: number;
  totalWinners?: number;
}

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

export interface PlatformStats {
  totalDraws: string;
  totalPrizeDistributed: string;
  totalTicketsSold: string;
  totalUsers: string;
  platformRevenue: string;
}