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
      { name: "drawType", type: "uint8" },
      {
        name: "config",
        type: "tuple",
        components: [
          { name: "ticketPrice", type: "uint256" },
          { name: "duration", type: "uint256" },
          { name: "maxTickets", type: "uint256" },
          { name: "initialPrize", type: "uint256" },
          { name: "requirement", type: "uint8" },
          { name: "requiredToken", type: "address" },
          { name: "minTokenAmount", type: "uint256" },
          {
            name: "prizeConfig",
            type: "tuple",
            components: [
              { name: "model", type: "uint8" },
              { name: "creatorContribution", type: "uint256" },
              { name: "addParticipationFees", type: "bool" },
              { name: "participationFeePercent", type: "uint256" },
              { name: "totalWinners", type: "uint256" }
            ]
          },
          {
            name: "lsp26Config",
            type: "tuple",
            components: [
              { name: "requireFollowing", type: "bool" },
              { name: "profileToFollow", type: "address" },
              { name: "minFollowers", type: "uint256" },
              { name: "requireMutualFollow", type: "bool" }
            ]
          },
          { name: "tokenAddress", type: "address" },
          { name: "nftContract", type: "address" },
          { name: "nftTokenIds", type: "bytes32[]" },
          {
            name: "tiers",
            type: "tuple[]",
            components: [
              { name: "prizePercentage", type: "uint256" },
              { name: "fixedPrize", type: "uint256" },
              { name: "nftTokenId", type: "bytes32" }
            ]
          }
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