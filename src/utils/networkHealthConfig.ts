import { NetworkHealthConfig } from 'interfaces/networkHealthConfig.interface'

export const networkHealthConfig: NetworkHealthConfig = {
  numberOfBlocksToAnalyze: 720, // number of latest blocks which will be analyzed, expected 720 Blocks/hour
  targetBlockTimeInSeconds: 5, // specifies the target blocktime for a healthy network
  minAllowedAverageBlocktime: 4.8, // an average below that will trigger a notification
  maxAllowedAverageBlocktime: 5.2, // an average above that will trigger a notification
  allowedSingleBlockTimeDeviationInSeconds: 0, // a deviation bigger than this value will mark a block as deviated
  allowedNumberDeviatedBlocks: 5 // if this threshold of deviated blocks is surpassed a notification will be sent
}
