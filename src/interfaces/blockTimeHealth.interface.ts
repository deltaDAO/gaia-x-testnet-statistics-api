export interface BlockTimeHealth {
  isHealthy: boolean
  averageBlockTime: number
  numberOfDeviatedBlocks: number
  startBlockNumber: number
  endBlockNumber: number
  numberOfBlocksAnalyzed: number
}
