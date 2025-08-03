// Import complete unified Diamond ABI
import { COMPLETE_DIAMOND_ABI } from './completeDiamondAbi';

// Import legacy ABIs for backward compatibility (but recommend using COMPLETE_DIAMOND_ABI)
import GridottoDiamond from './GridottoDiamond.json';
import GridottoCoreFacet from './ui-abis/GridottoCoreFacet.json';
import GridottoExecutionFacet from './ui-abis/GridottoExecutionFacet.json';
import GridottoLeaderboardFacet from './ui-abis/GridottoLeaderboardFacet.json';
import GridottoAdminFacet from './ui-abis/GridottoAdminFacet.json';

// === PRIMARY EXPORTS (Use these) ===
export const diamondAbi = COMPLETE_DIAMOND_ABI; // Updated to use complete ABI
export const combinedAbi = COMPLETE_DIAMOND_ABI; // Use complete unified ABI
export { COMPLETE_DIAMOND_ABI } from './completeDiamondAbi';

// === LEGACY EXPORTS (Backward compatibility only) ===
export const legacyDiamondAbi = GridottoDiamond;
export const coreAbi = GridottoCoreFacet;
export const executionAbi = GridottoExecutionFacet;
export const leaderboardAbi = GridottoLeaderboardFacet;
export const adminAbi = GridottoAdminFacet;

// Helper to get specific facet ABI (legacy, use COMPLETE_DIAMOND_ABI instead)
export const getFacetAbi = (facetName: 'core' | 'execution' | 'leaderboard' | 'admin') => {
  console.warn(`getFacetAbi(${facetName}) is deprecated. Use COMPLETE_DIAMOND_ABI instead.`);
  switch (facetName) {
    case 'core':
      return GridottoCoreFacet;
    case 'execution':
      return GridottoExecutionFacet;
    case 'leaderboard':
      return GridottoLeaderboardFacet;
    case 'admin':
      return GridottoAdminFacet;
    default:
      throw new Error(`Unknown facet: ${facetName}`);
  }
};