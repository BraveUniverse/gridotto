// Import complete Diamond ABI
import GridottoDiamond from './GridottoDiamond.json';

// Import UI ABIs (kept for backward compatibility)
import GridottoCoreFacet from './ui-abis/GridottoCoreFacet.json';
import GridottoExecutionFacet from './ui-abis/GridottoExecutionFacet.json';
import GridottoLeaderboardFacet from './ui-abis/GridottoLeaderboardFacet.json';
import GridottoAdminFacet from './ui-abis/GridottoAdminFacet.json';

// Export complete Diamond ABI
export const diamondAbi = GridottoDiamond;
export const combinedAbi = GridottoDiamond; // Use complete Diamond ABI

// Export individual ABIs (kept for backward compatibility)
export const coreAbi = GridottoCoreFacet;
export const executionAbi = GridottoExecutionFacet;
export const leaderboardAbi = GridottoLeaderboardFacet;
export const adminAbi = GridottoAdminFacet;

// Helper to get specific facet ABI
export const getFacetAbi = (facetName: 'core' | 'execution' | 'leaderboard' | 'admin') => {
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