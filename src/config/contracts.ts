// Diamond Contract Configuration
export const CONTRACTS = {
  LUKSO_TESTNET: {
    DIAMOND: '0x5Ad808FAE645BA3682170467114e5b80A70bF276' as const,
    GRIDOTTO_FACET: '0x5A8C9D3E7B2F4A1E6C9B0F8D7E5A3C2B1D8F9E7A' as const,
    PHASE3_FACET: '0x71E30D0055d57C796EB9F9fB94AD128B4C377F9B' as const,
    PHASE4_FACET: '0xfF7A397d8d33f66C8cf4417D6D355CdBF62D482b' as const,
    ADMIN_FACET: '0x3d06FbdeAD6bD7e71E75C4576607713E7bbaF49D' as const,
    ORACLE_FACET: '0x4E7B9A3C5D8F2E1A6B9C0D8E7F5A3B2C1D6E9F8A' as const,
    OWNERSHIP_FACET: '0x9D6B5E8C3A2F1E7D4B8A0C9F6E3D5A2B1C7F8E6A' as const,
    UI_HELPER_FACET: '0xc874cD999d7f0E0dD2770a3597d16707a8517f2a' as const,
    BATCH_FACET: '0x3a0804dA2a0149806Df3E27b3A29CF8056B1213A' as const,
  }
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
export const GRIDOTTO_CONTRACT_ADDRESS = CONTRACTS.LUKSO_TESTNET.DIAMOND;
export const VIP_PASS_ADDRESS = '0x5DD5fF2562ce2De02955eebB967C6094de438428';