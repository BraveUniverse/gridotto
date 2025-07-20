export const phase3Abi = [
  // Events
  {
    inputs: [
      { name: "drawId", type: "uint256" },
      { name: "creator", type: "address" },
      { name: "tokenAddress", type: "address" },
      { name: "prizeAmount", type: "uint256" }
    ],
    name: "TokenDrawCreated",
    type: "event"
  },
  {
    inputs: [
      { name: "drawId", type: "uint256" },
      { name: "creator", type: "address" },
      { name: "nftContract", type: "address" },
      { name: "tokenIds", type: "bytes32[]" }
    ],
    name: "NFTDrawCreated",
    type: "event"
  },
  // Functions
  {
    inputs: [
      { name: "tokenAddress", type: "address" },
      { name: "prizeAmount", type: "uint256" },
      { name: "ticketPrice", type: "uint256" },
      { name: "duration", type: "uint256" },
      { name: "maxTickets", type: "uint256" },
      { name: "requirement", type: "uint256" },
      { name: "requiredToken", type: "address" },
      { name: "minTokenAmount", type: "uint256" }
    ],
    name: "createTokenDraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "nftContract", type: "address" },
      { name: "tokenIds", type: "bytes32[]" },
      { name: "ticketPrice", type: "uint256" },
      { name: "duration", type: "uint256" },
      { name: "maxTickets", type: "uint256" },
      { name: "requirement", type: "uint256" },
      { name: "requiredToken", type: "address" },
      { name: "minTokenAmount", type: "uint256" }
    ],
    name: "createNFTDraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "drawId", type: "uint256" },
      { name: "amount", type: "uint256" }
    ],
    name: "buyTokenDrawTicket",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "drawId", type: "uint256" },
      { name: "amount", type: "uint256" }
    ],
    name: "buyNFTDrawTicket",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  }
] as const;