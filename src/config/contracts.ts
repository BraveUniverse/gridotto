// Diamond Contract Configuration
export const CONTRACTS = {
  // Main Diamond Proxy
  DIAMOND: "0x5Ad808FAE645BA3682170467114e5b80A70bF276",
  DIAMOND_ADDRESS: "0x5Ad808FAE645BA3682170467114e5b80A70bF276", // Alias for compatibility
  
  // Core Diamond Facets
  DIAMOND_CUT_FACET: "0x8B5a6F9e2c3E5D4A1B7C9F0E8D6A3B2C1A9F7E5D",
  DIAMOND_LOUPE_FACET: "0x7C4a8F3e9B2D5E6A1C8F0B9E7D4A2C3B1A8E6F5D",
  OWNERSHIP_FACET: "0x9D6B5E8C3A2F1E7D4B8A0C9F6E3D5A2B1C7F8E6A",
  
  // Gridotto Facets
  ORACLE_FACET: "0x4E7B9A3C5D8F2E1A6B9C0D8E7F5A3B2C1D6E9F8A",
  GRIDOTTO_FACET: "0x5A8C9D3E7B2F4A1E6C9B0F8D7E5A3C2B1D8F9E7A",
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