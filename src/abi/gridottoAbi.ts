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
    inputs: [
      { name: "amount", type: "uint256" }
    ],
    name: "buyTickets",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "amount", type: "uint256" }
    ],
    name: "buyMonthlyTickets",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "getTicketPrice",
    outputs: [
      { name: "", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getCurrentDrawPrize",
    outputs: [
      { name: "", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getMonthlyPrize",
    outputs: [
      { name: "", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getDrawInfo",
    outputs: [
      { name: "currentDraw", type: "uint256" },
      { name: "currentMonthlyDraw", type: "uint256" },
      { name: "drawTime", type: "uint256" },
      { name: "monthlyDrawTime", type: "uint256" }
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
    inputs: [],
    name: "getContractBalance",
    outputs: [
      { name: "", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      { name: "", type: "bytes32" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "role", type: "bytes32" },
      { name: "account", type: "address" }
    ],
    name: "hasRole",
    outputs: [
      { name: "", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "amount", type: "uint256" }
    ],
    name: "adminWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "price", type: "uint256" }
    ],
    name: "setTicketPrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;