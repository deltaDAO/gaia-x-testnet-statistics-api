export interface NetworkHealthConfig {
  numberOfBlocks: number
  targetBlockTimeInSeconds: number
  minAllowedAverageBlocktime: number
  maxAllowedAverageBlocktime: number
  allowedSingleBlockTimeDeviationInSeconds: number
  allowedNumberDeviatedBlocks: number
}
