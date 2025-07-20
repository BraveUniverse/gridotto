export const batchAbi = [
  {
    inputs: [],
    name: "claimAll",
    outputs: [{ name: "totalClaimed", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "recipients", type: "address[]" },
      { name: "amounts", type: "uint256[]" }
    ],
    name: "batchTransferLYX",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ name: "drawIds", type: "uint256[]" }],
    name: "batchGetUserDrawInfo",
    outputs: [
      {
        components: [
          { name: "creator", type: "address" },
          { name: "endTime", type: "uint256" },
          { name: "prizePool", type: "uint256" }
        ],
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const;