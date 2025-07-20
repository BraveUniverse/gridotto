export const gridottoAbi = [
  // Events
  {
    inputs: [
      { name: "buyer", type: "address" },
      { name: "profileId", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "drawType", type: "uint256" }
    ],
    name: "TicketPurchased",
    type: "event"
  },
  {
    inputs: [
      { name: "drawNumber", type: "uint256" },
      { name: "winner", type: "address" },
      { name: "prize", type: "uint256" },
      { name: "drawType", type: "uint256" }
    ],
    name: "WinnerSelected",
    type: "event"
  },
  // Functions
  {
    inputs: [
      { name: "profileId", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    name: "buyTicket",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "getDrawInfo",
    outputs: [
      { name: "drawNumber", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "prize", type: "uint256" },
      { name: "ticketsSold", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getMonthlyDrawInfo",
    outputs: [
      { name: "drawNumber", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "prize", type: "uint256" },
      { name: "ticketsSold", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "drawId", type: "uint256" }],
    name: "getUserDraw",
    outputs: [
      { name: "creator", type: "address" },
      { name: "drawType", type: "uint256" },
      { name: "ticketPrice", type: "uint256" },
      { name: "ticketsSold", type: "uint256" },
      { name: "maxTickets", type: "uint256" },
      { name: "currentPrizePool", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "isCompleted", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "nextDrawId",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
] as const;