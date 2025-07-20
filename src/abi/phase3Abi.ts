export const phase3Abi = [
  // Events
  {
    inputs: [
      { name: "drawId", type: "uint256" },
      { name: "creator", type: "address" },
      { name: "tokenAddress", type: "address" }
    ],
    name: "TokenDrawCreated",
    type: "event"
  },
  {
    inputs: [
      { name: "drawId", type: "uint256" },
      { name: "creator", type: "address" },
      { name: "nftContract", type: "address" },
      { name: "tokenId", type: "bytes32" }
    ],
    name: "NFTDrawCreated",
    type: "event"
  },
  // Functions
  {
    inputs: [
      { name: "tokenAddress", type: "address" },
      { name: "initialPrize", type: "uint256" },
      { name: "ticketPriceLYX", type: "uint256" },
      { name: "duration", type: "uint256" },
      { name: "minParticipants", type: "uint256" },
      { name: "maxParticipants", type: "uint256" },
      { name: "creatorFeePercent", type: "uint256" }
    ],
    name: "createTokenDraw",
    outputs: [{ name: "drawId", type: "uint256" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "nftContract", type: "address" },
      { name: "tokenId", type: "bytes32" },
      { name: "ticketPrice", type: "uint256" },
      { name: "duration", type: "uint256" },
      { name: "minParticipants", type: "uint256" },
      { name: "maxParticipants", type: "uint256" }
    ],
    name: "createNFTDraw",
    outputs: [{ name: "drawId", type: "uint256" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "drawId", type: "uint256" },
      { name: "amount", type: "uint256" }
    ],
    name: "buyUserDrawTicket",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ name: "drawId", type: "uint256" }],
    name: "executeUserDraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "token", type: "address" }],
    name: "claimTokenPrize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "nftContract", type: "address" }],
    name: "claimNFTPrize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Refund Functions
  {
    inputs: [
      { name: "drawId", type: "uint256" }
    ],
    name: "refundDraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "drawId", type: "uint256" }
    ],
    name: "claimRefund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;