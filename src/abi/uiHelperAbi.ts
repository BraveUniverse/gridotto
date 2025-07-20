export const uiHelperAbi = [
  {
    inputs: [
      { name: "creator", type: "address" },
      { name: "offset", type: "uint256" },
      { name: "limit", type: "uint256" }
    ],
    name: "getUserCreatedDraws",
    outputs: [{ name: "drawIds", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "limit", type: "uint256" }],
    name: "getActiveUserDraws",
    outputs: [
      {
        components: [
          { name: "drawId", type: "uint256" },
          { name: "creator", type: "address" },
          { name: "endTime", type: "uint256" }
        ],
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getAllClaimablePrizes",
    outputs: [
      { name: "totalLYX", type: "uint256" },
      { name: "hasTokenPrizes", type: "bool" },
      { name: "hasNFTPrizes", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "drawId", type: "uint256" }],
    name: "getUserDrawStats",
    outputs: [
      {
        components: [
          { name: "creator", type: "address" },
          { name: "endTime", type: "uint256" },
          { name: "prizePool", type: "uint256" },
          { name: "totalParticipants", type: "uint256" },
          { name: "totalTicketsSold", type: "uint256" }
        ],
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getOfficialDrawInfo",
    outputs: [
      {
        components: [
          { name: "currentDrawNumber", type: "uint256" },
          { name: "nextDrawTime", type: "uint256" },
          { name: "ticketPrice", type: "uint256" }
        ],
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "drawId", type: "uint256" }],
    name: "getUserDraw",
    outputs: [
      { name: "creator", type: "address" },
      { name: "drawType", type: "uint8" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "ticketPrice", type: "uint256" },
      { name: "maxTickets", type: "uint256" },
      { name: "ticketsSold", type: "uint256" },
      { name: "currentPrizePool", type: "uint256" },
      { name: "isCompleted", type: "bool" },
      { name: "isExecuted", type: "bool" },
      { name: "requirement", type: "uint8" },
      { name: "requiredToken", type: "address" },
      { name: "minTokenAmount", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "drawId", type: "uint256" }],
    name: "getUserDrawExecutorReward",
    outputs: [{ name: "reward", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "drawId", type: "uint256" },
      { name: "offset", type: "uint256" },
      { name: "limit", type: "uint256" }
    ],
    name: "getDrawParticipants",
    outputs: [
      { name: "participants", type: "address[]" },
      { name: "ticketCounts", type: "uint256[]" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "drawId", type: "uint256" },
      { name: "user", type: "address" }
    ],
    name: "canUserParticipate",
    outputs: [
      { name: "canParticipate", type: "bool" },
      { name: "reason", type: "string" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "user", type: "address" },
      { name: "offset", type: "uint256" },
      { name: "limit", type: "uint256" }
    ],
    name: "getUserParticipationHistory",
    outputs: [
      { name: "drawIds", type: "uint256[]" },
      { name: "ticketsBought", type: "uint256[]" },
      { name: "won", type: "bool[]" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "offset", type: "uint256" },
      { name: "limit", type: "uint256" }
    ],
    name: "getRecentWinners",
    outputs: [
      {
        components: [
          { name: "winner", type: "address" },
          { name: "drawId", type: "uint256" },
          { name: "drawType", type: "uint8" },
          { name: "prizeAmount", type: "uint256" },
          { name: "prizeToken", type: "address" },
          { name: "nftTokenId", type: "bytes32" },
          { name: "drawCreator", type: "address" },
          { name: "timestamp", type: "uint256" }
        ],
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "drawId", type: "uint256" }],
    name: "getAdvancedDrawInfo",
    outputs: [
      { name: "creator", type: "address" },
      { name: "drawType", type: "uint8" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "ticketPrice", type: "uint256" },
      { name: "totalTickets", type: "uint256" },
      { name: "participantCount", type: "uint256" },
      { name: "prizePool", type: "uint256" },
      { name: "tokenAddress", type: "address" },
      { name: "nftContract", type: "address" },
      { name: "nftCount", type: "uint256" },
      { name: "isCompleted", type: "bool" },
      { name: "winners", type: "address[]" },
      { name: "minParticipants", type: "uint256" },
      { name: "maxParticipants", type: "uint256" },
      { name: "requirement", type: "uint8" },
      { name: "executorReward", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  // Edge Case Improvement Functions
  {
    inputs: [
      { name: "limit", type: "uint256" }
    ],
    name: "getExpiredDrawsWaitingExecution",
    outputs: [
      { name: "drawIds", type: "uint256[]" },
      { name: "endTimes", type: "uint256[]" },
      { name: "participantCounts", type: "uint256[]" },
      { name: "minParticipants", type: "uint256[]" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "drawId", type: "uint256" }
    ],
    name: "canExecuteDraw",
    outputs: [
      { name: "canExecute", type: "bool" },
      { name: "reason", type: "string" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "limit", type: "uint256" }
    ],
    name: "getDrawsForCleanup",
    outputs: [
      { name: "drawIds", type: "uint256[]" },
      { name: "creators", type: "address[]" },
      { name: "endTimes", type: "uint256[]" },
      { name: "participantCounts", type: "uint256[]" }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const;