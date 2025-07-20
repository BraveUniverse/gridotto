export const phase4Abi = [
  // Events
  {
    inputs: [
      { name: "drawId", type: "uint256" },
      { name: "creator", type: "address" },
      { name: "drawType", type: "uint8" }
    ],
    name: "AdvancedDrawCreated",
    type: "event"
  },
  // Functions
  {
    inputs: [
      {
        name: "config",
        type: "tuple",
        components: [
          { name: "drawType", type: "uint8" },
          { name: "ticketPrice", type: "uint256" },
          { name: "duration", type: "uint256" },
          { name: "prizeToken", type: "address" },
          { name: "initialPrize", type: "uint256" },
          { name: "nftTokenIds", type: "bytes32[]" },
          { name: "numberOfWinners", type: "uint256" },
          {
            name: "tiers",
            type: "tuple[]",
            components: [
              { name: "winnerCount", type: "uint256" },
              { name: "prizePercentage", type: "uint256" },
              { name: "fixedPrizeAmount", type: "uint256" },
              { name: "specificNFTId", type: "bytes32" }
            ]
          },
          { name: "requirement", type: "uint8" },
          { name: "requiredToken", type: "address" },
          { name: "minTokenAmount", type: "uint256" },
          { name: "minFollowers", type: "uint256" },
          { name: "creatorFeePercent", type: "uint256" },
          { name: "minParticipants", type: "uint256" },
          { name: "maxParticipants", type: "uint256" },
          { name: "maxTicketsPerUser", type: "uint256" }
        ]
      }
    ],
    name: "createAdvancedDraw",
    outputs: [{ name: "drawId", type: "uint256" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "drawId", type: "uint256" },
      { name: "ticketCount", type: "uint256" }
    ],
    name: "purchaseTickets",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ name: "drawId", type: "uint256" }],
    name: "executeDraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "drawId", type: "uint256" }],
    name: "claimPrize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;