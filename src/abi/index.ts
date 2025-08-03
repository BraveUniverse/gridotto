// Import legacy ABIs for backward compatibility
import GridottoDiamond from './GridottoDiamond.json';
import GridottoCoreFacet from './ui-abis/GridottoCoreFacet.json';
import GridottoExecutionFacet from './ui-abis/GridottoExecutionFacet.json';
import GridottoLeaderboardFacet from './ui-abis/GridottoLeaderboardFacet.json';
import GridottoAdminFacet from './ui-abis/GridottoAdminFacet.json';

// === PRIMARY EXPORTS (Use these) ===
export const diamondAbi = GridottoDiamond; // Use original GridottoDiamond.json which works
export const combinedAbi = GridottoDiamond; // Use original GridottoDiamond.json which works

// === LEGACY EXPORTS (Backward compatibility only) ===
export const legacyDiamondAbi = GridottoDiamond;
export const coreAbi = GridottoCoreFacet;
export const executionAbi = GridottoExecutionFacet;
export const leaderboardAbi = GridottoLeaderboardFacet;
export const adminAbi = GridottoAdminFacet;

// Helper to get specific facet ABI (legacy, use diamondAbi instead)
export const getFacetAbi = (facetName: 'core' | 'execution' | 'leaderboard' | 'admin') => {
  console.warn(`getFacetAbi(${facetName}) is deprecated. Use diamondAbi instead.`);
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