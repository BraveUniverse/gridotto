// Diamond Contract Configuration
export const CONTRACTS = {
  LUKSO_TESTNET: {
    DIAMOND: '0x00102a0aAb6027bB027C0F032583Cf88353E4900' as const, // Updated: January 28, 2025
    // Core Facets
    DIAMOND_CUT_FACET: '0x0F56c97Efa9489e56c5182e0ec8D1b1DDb0d56EB' as const,
    DIAMOND_LOUPE_FACET: '0x064B536aC9Be1468bCE43E3b027B7Dc2c31B3241' as const,
    OWNERSHIP_FACET: '0x7588A48567f592b1df4E94b1DF3d08D7e174B6e9' as const,
    // Gridotto Facets
    GRIDOTTO_CORE_V2_FACET: '0xD833b388D66e8c89C2e27CE215Ef3aCa01652639' as const,
    GRIDOTTO_EXECUTION_V2_FACET: '0xf5F14FcC509d8f2B66C1c27755aDBd899157Dd10' as const,
    GRIDOTTO_PLATFORM_DRAWS_FACET: '0xc04324D3E6f462c6dC025ef55eE04fdC65FeD186' as const,
    GRIDOTTO_ADMIN_FACET_V2: '0x07F97a283F980Fd9e349Ef485e09340CbB3b9Dd2' as const,
    GRIDOTTO_REFUND_FACET: '0x5350C748ceb4eD5905a62e102906161468221c73' as const,
    GRIDOTTO_PRIZE_CLAIM_FACET: '0xB427E429408963cf129035B54cB7629B814f00B8' as const,
    GRIDOTTO_LEADERBOARD_FACET: '0x74183a4D37f59Cb363Be0a495d080b2546637465' as const,
    ORACLE_FACET: '0x742caF743B3A97B7204D3b2dBFb3CC23Da0b96C6' as const,
    // Legacy names for backward compatibility
    GRIDOTTO_FACET: '0xD833b388D66e8c89C2e27CE215Ef3aCa01652639' as const, // Points to Core V2
    PHASE3_FACET: '0xf5F14FcC509d8f2B66C1c27755aDBd899157Dd10' as const, // Points to Execution V2
    PHASE4_FACET: '0xc04324D3E6f462c6dC025ef55eE04fdC65FeD186' as const, // Points to Platform Draws
    ADMIN_FACET: '0x07F97a283F980Fd9e349Ef485e09340CbB3b9Dd2' as const, // Points to Admin V2
    UI_HELPER_FACET: '0xc874cD999d7f0E0dD2770a3597d16707a8517f2a' as const, // Keep old if still used
    BATCH_FACET: '0x3a0804dA2a0149806Df3E27b3A29CF8056B1213A' as const, // Keep old if still used
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