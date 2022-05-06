export interface BlockTimeHealth {
  healthy: boolean
  averageBlockTime: number
  numberOfDeviatedBlocks: number
  startBlockNumber: number
  endBlockNumber: number
  numberOfBlocksAnalyzed: number
}
