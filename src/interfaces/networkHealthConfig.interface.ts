export interface NetworkHealthConfig {
  numberOfBlocksToAnalyze: number
  targetBlockTimeInSeconds: number
  minAllowedAverageBlocktime: number
  maxAllowedAverageBlocktime: number
  allowedSingleBlockTimeDeviationInSeconds: number
  allowedNumberDeviatedBlocks: number
}
