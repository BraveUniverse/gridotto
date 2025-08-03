// Complete Diamond ABI - Unified version
// This includes all functions from GridottoDiamond.json plus documented functions

export const COMPLETE_DIAMOND_ABI = [
  // === CORE FUNCTIONS ===
  "function buyTickets(uint256 drawId, uint256 amount) payable",
  "function getDrawDetails(uint256 drawId) view returns (address creator, uint8 drawType, address tokenAddress, uint256 ticketPrice, uint256 maxTickets, uint256 ticketsSold, uint256 prizePool, uint256 startTime, uint256 endTime, uint256 minParticipants, uint256 platformFeePercent, bool isCompleted, bool isCancelled, uint256 participantCount, uint256 monthlyPoolContribution, uint256 executorFeeCollected)",
  "function getDrawNFTDetails(uint256 drawId) view returns (address nftContract, bytes32[] tokenIds, uint8 drawType)",
  "function getNextDrawId() view returns (uint256)",
  "function createLYXDraw(uint256 ticketPrice, uint256 maxTickets, uint256 duration, uint256 minParticipants, uint256 platformFeePercent, uint256 creatorContribution) payable",
  "function createNFTDraw(address nftContract, bytes32[] tokenIds, uint256 ticketPrice, uint256 duration, uint256 maxTickets, uint8 requirement, address requiredToken, uint256 minTokenAmount) payable",
  "function getDrawParticipants(uint256 drawId) view returns (address[])",
  "function getUserDrawHistory(address user) view returns (uint256[])",
  "function getUserTickets(address user, uint256 drawId) view returns (uint256)",

  // === PLATFORM FUNCTIONS ===
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
  },

  // === EXECUTION FUNCTIONS ===
  "function executeDraw(uint256 drawId)",
  "function canExecuteDraw(uint256 drawId) view returns (bool)",
  "function getDrawWinners(uint256 drawId) view returns (address[] winners, uint256[] amounts)",
  "function getUnclaimedPrizes(address user) view returns (uint256[] drawIds, uint256[] amounts)",
  "function claimPrize(uint256 drawId)",
  "function getClaimableExecutorFees(address executor) view returns (uint256[] drawIds, uint256[] amounts)",
  "function claimExecutorFee(uint256 drawId)",

  // === LEADERBOARD FUNCTIONS ===
  "function getTopCreators(uint256 limit) view returns (address[] creators, uint256[] counts)",
  "function getTopParticipants(uint256 limit) view returns (address[] participants, uint256[] counts)",
  "function getUserStats(address user) view returns (uint256 drawsCreated, uint256 drawsParticipated, uint256 totalTicketsBought, uint256 totalPrizesWon)",

  // === ADMIN FUNCTIONS ===
  "function pause()",
  "function unpause()",
  "function updatePlatformFee(uint256 newFeePercent)",
  "function updateMinimumTicketPrice(uint256 newMinPrice)",
  "function emergencyWithdraw(uint256 amount)",
  "function updateExecutorRewardPercent(uint256 newPercent)",

  // === DIAMOND STANDARD FUNCTIONS ===
  "function facets() view returns (tuple(address facetAddress, bytes4[] functionSelectors)[])",
  "function facetFunctionSelectors(address facet) view returns (bytes4[])",
  "function facetAddresses() view returns (address[])",
  "function facetAddress(bytes4 functionSelector) view returns (address)",
  
  // === OWNERSHIP FUNCTIONS ===
  "function owner() view returns (address)",
  "function transferOwnership(address newOwner)",
  "function renounceOwnership()",

  // === ERC165 ===
  "function supportsInterface(bytes4 interfaceId) view returns (bool)"
];

// Legacy exports for backward compatibility
export const NEW_DIAMOND_ABI = COMPLETE_DIAMOND_ABI;
export const CORE_ABI = COMPLETE_DIAMOND_ABI;
export const PLATFORM_ABI = COMPLETE_DIAMOND_ABI;
export const EXECUTION_ABI = COMPLETE_DIAMOND_ABI;

// Default export
export default COMPLETE_DIAMOND_ABI;