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
  }
] as const;