import { gridottoAbi } from './gridottoAbi';
import { phase3Abi } from './phase3Abi';
import { phase4Abi } from './phase4Abi';
import { uiHelperAbi } from './uiHelperAbi';
import { batchAbi } from './batchAbi';
import { adminAbi } from './adminAbi';
import { executionAbi } from './executionAbi';

export const combinedAbi = [
  ...gridottoAbi,
  ...phase3Abi,
  ...phase4Abi,
  ...uiHelperAbi,
  ...batchAbi,
  ...adminAbi,
  ...executionAbi
] as const;

export {
  gridottoAbi,
  phase3Abi,
  phase4Abi,
  uiHelperAbi,
  batchAbi,
  adminAbi,
  executionAbi
};