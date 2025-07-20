export const executionAbi = [
  // Force Execute (Owner only)
  {
    inputs: [
      { name: "drawId", type: "uint256" }
    ],
    name: "forceExecuteDraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Cancel User Draw (Updated)
  {
    inputs: [
      { name: "drawId", type: "uint256" }
    ],
    name: "cancelUserDraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Execute User Draw
  {
    inputs: [
      { name: "drawId", type: "uint256" }
    ],
    name: "executeUserDraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Get User Draw Executor Reward
  {
    inputs: [
      { name: "drawId", type: "uint256" }
    ],
    name: "getUserDrawExecutorReward",
    outputs: [
      { name: "", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const;