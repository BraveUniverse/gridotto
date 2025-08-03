// Core Functions ABI from UI Integration Guide
export const CORE_ABI = [
  "function buyTickets(uint256 drawId, uint256 amount) payable",
  "function getDrawDetails(uint256 drawId) view returns (address creator, uint8 drawType, address tokenAddress, uint256 ticketPrice, uint256 maxTickets, uint256 ticketsSold, uint256 prizePool, uint256 startTime, uint256 endTime, uint256 minParticipants, uint256 platformFeePercent, bool isCompleted, bool isCancelled, uint256 participantCount, uint256 monthlyPoolContribution, uint256 executorFeeCollected)",
  "function getDrawNFTDetails(uint256 drawId) view returns (address nftContract, bytes32[] tokenIds, uint8 drawType)",
  "function createLYXDraw(uint256 ticketPrice, uint256 maxTickets, uint256 duration, uint256 minParticipants, uint256 platformFeePercent, uint256 creatorContribution) payable"
];

// Platform Functions ABI
export const PLATFORM_ABI = [
  "function getPlatformDrawsInfo() view returns (uint256 weeklyDrawId, uint256 monthlyDrawId, uint256 weeklyEndTime, uint256 monthlyEndTime, uint256 monthlyPoolBalance, uint256 weeklyCount)",
  "function getUserMonthlyTickets(address user) view returns (uint256 fromWeekly, uint256 fromCreating, uint256 fromParticipating, uint256 total)",
  "function executeWeeklyDraw()",
  "function executeMonthlyDraw()",
  {
    "inputs": [],
    "name": "getPlatformStats",
    "outputs": [
      {
        "components": [
          {"name": "totalPrizesDistributed", "type": "uint256"},
          {"name": "totalTicketsSold", "type": "uint256"},
          {"name": "totalDrawsCreated", "type": "uint256"},
          {"name": "totalExecutions", "type": "uint256"}
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Execution Functions ABI
export const EXECUTION_ABI = [
  "function executeDraw(uint256 drawId)",
  "function canExecuteDraw(uint256 drawId) view returns (bool)",
  "function getDrawWinners(uint256 drawId) view returns (address[] winners, uint256[] amounts)"
];

// Combined ABI for the new Diamond
export const NEW_DIAMOND_ABI = [
  ...CORE_ABI,
  ...PLATFORM_ABI,
  ...EXECUTION_ABI
];