export const phase4Abi = [
  // Functions
  {
    inputs: [
      { name: "endTime", type: "uint256" },
      { name: "ticketPrice", type: "uint256" },
      { name: "maxTickets", type: "uint256" },
      { name: "minTickets", type: "uint256" }
    ],
    name: "createDraw",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
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
    inputs: [
      { name: "drawId", type: "uint256" },
      { name: "prizeModel", type: "uint256" },
      { name: "totalWinners", type: "uint256" },
      { name: "winnerShares", type: "uint256[]" }
    ],
    name: "createAdvancedDraw",
    outputs: [],
    stateMutability: "nonpayable",
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