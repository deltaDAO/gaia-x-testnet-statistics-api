import { NetworkHealthConfig } from 'interfaces/networkHealthConfig.interface'

export const networkHealthConfig: NetworkHealthConfig = {
  // number of latest blocks which will be analyzed, expected 720 Blocks/hour
  numberOfBlocksToAnalyze: Number(process.env.HEALTH_NUMBER_OF_BLOCKS) || 720,

  // specifies the target blocktime for a healthy network
  targetBlockTimeInSeconds: Number(process.env.HEALTH_TARGET_BLOCK_TIME) || 5,

  // an average below that will trigger a notification
  minAllowedAverageBlocktime: Number(process.env.HEALTH_MIN_AVG_BLOCK_TIME) || 4.8,

  // an average above that will trigger a notification
  maxAllowedAverageBlocktime: Number(process.env.HEALTH_MAX_AVG_BLOCK_TIME) || 5.2,

  // a deviation bigger than this value will mark a block as deviated
  allowedSingleBlockTimeDeviationInSeconds:
    process.env.HEALTH_ALLOWED_DEVIATION_SECS === undefined ? 0 : Number(process.env.HEALTH_ALLOWED_DEVIATION_SECS),

  // if this threshold of deviated blocks is surpassed a notification will be sent
  allowedNumberDeviatedBlocks: process.env.HEALTH_ALLOWED_DEVIATED_BLOCKS === undefined ? 5 : Number(process.env.HEALTH_ALLOWED_DEVIATED_BLOCKS)
}
