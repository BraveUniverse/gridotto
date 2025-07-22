// Import UI ABIs
import GridottoCoreFacet from './ui-abis/GridottoCoreFacet.json';
import GridottoExecutionFacet from './ui-abis/GridottoExecutionFacet.json';
import GridottoLeaderboardFacet from './ui-abis/GridottoLeaderboardFacet.json';
import GridottoAdminFacet from './ui-abis/GridottoAdminFacet.json';

// Export individual ABIs
export const coreAbi = GridottoCoreFacet;
export const executionAbi = GridottoExecutionFacet;
export const leaderboardAbi = GridottoLeaderboardFacet;
export const adminAbi = GridottoAdminFacet;

// Combine all ABIs for Diamond pattern
export const combinedAbi = [
  ...GridottoCoreFacet,
  ...GridottoExecutionFacet,
  ...GridottoLeaderboardFacet,
  ...GridottoAdminFacet
];

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