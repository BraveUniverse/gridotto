// Diamond Contract Configuration
export const CONTRACTS = {
  // Main Diamond Proxy
  DIAMOND: "0x5Ad808FAE645BA3682170467114e5b80A70bF276",
  
  // Facet Addresses
  GRIDOTTO_FACET: "0x5Ad808FAE645BA3682170467114e5b80A70bF276", // Same as diamond for main functions
  PHASE3_FACET: "0x71E30D0055d57C796EB9F9fB94AD128B4C377F9B",
  PHASE4_FACET: "0xfF7A397d8d33f66C8cf4417D6D355CdBF62D482b",
  ADMIN_FACET: "0x3d06FbdeAD6bD7e71E75C4576607713E7bbaF49D",
  
  // Legacy addresses (for backward compatibility)
  GRIDOTTO_CONTRACT_ADDRESS: "0x5Ad808FAE645BA3682170467114e5b80A70bF276",
  VIP_PASS_ADDRESS: "0x5DD5fF2562ce2De02955eebB967C6094de438428",
} as const;

// Network Configuration
export const NETWORK = {
  CHAIN_ID: 4201,
  NAME: "LUKSO Testnet",
  RPC_URL: "https://rpc.testnet.lukso.network",
  EXPLORER_URL: "https://explorer.execution.testnet.lukso.network",
  CURRENCY: {
    NAME: "LYX",
    SYMBOL: "LYX",
    DECIMALS: 18
  }
} as const;

// API Configuration for Vercel
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "/api",
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || "wss://api.gridotto.com",
  ENDPOINTS: {
    DRAWS: "/draws",
    USERS: "/users",
    STATS: "/stats",
    ADMIN: "/admin"
  }
} as const;

// Export legacy names for backward compatibility
export const GRIDOTTO_CONTRACT_ADDRESS = CONTRACTS.GRIDOTTO_CONTRACT_ADDRESS;
export const VIP_PASS_ADDRESS = CONTRACTS.VIP_PASS_ADDRESS;