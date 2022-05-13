import { NetworkHealth } from 'interfaces/networkHealth.interface'
import { BlockTimeHealth } from '../interfaces/blockTimeHealth.interface'
import { getLatestBlocks } from '../repositories/block.repository'
import { logger } from './logger'
import { networkHealthConfig } from './networkHealthConfig'
import { networkHealthNotification } from './notifications'

export async function checkNetworkHealth() {
  const blockTimeHealth = await calculateBlockTimeHealth()
  if (!blockTimeHealth) return

  // will be expanded with additional checks
  const networkHealth: NetworkHealth = {
    blockTimeHealth
  }
  logger.info(JSON.stringify(networkHealth))

  if (!blockTimeHealth.isHealthy) {
    networkHealthNotification(networkHealth)
  }
}

async function calculateBlockTimeHealth(): Promise<BlockTimeHealth> {
  const {
    allowedNumberDeviatedBlocks,
    allowedSingleBlockTimeDeviationInSeconds,
    maxAllowedAverageBlocktime,
    minAllowedAverageBlocktime,
    numberOfBlocks,
    targetBlockTimeInSeconds
  } = networkHealthConfig
  const minAllowedBlocktime = targetBlockTimeInSeconds - allowedSingleBlockTimeDeviationInSeconds
  const maxAllowedBlocktime = targetBlockTimeInSeconds + allowedSingleBlockTimeDeviationInSeconds
  const minNumberOfBlocks = 10

  try {
    const latestBlocks = await getLatestBlocks(numberOfBlocks)
    const startBlockNumber = latestBlocks[latestBlocks.length - 1].blockNumber
    const endBlockNumber = latestBlocks[0].blockNumber
    const includesGenesis = startBlockNumber === 0

    if (latestBlocks.length < minNumberOfBlocks) {
      logger.warn(`Not enough blocks to analyze. Number of blocks: ${latestBlocks.length}, minimal numberOfBlocks: ${minNumberOfBlocks}`)
      return null
    }
    if (latestBlocks.length < numberOfBlocks) {
      logger.warn(
        `Not enough blocks to analyze. The in the networkHealthConfig specified number could not be reached. Number of blocks: ${latestBlocks.length}, specified numberOfBlocks: ${numberOfBlocks}`
      )
      return null
    }

    let blockTimeSum = 0
    let lastBlockTimeStamp = 0
    let numberOfDeviatedBlocks = 0

    for (const block of latestBlocks) {
      if (lastBlockTimeStamp && block.blockNumber !== 0) {
        const blockTime = lastBlockTimeStamp - block.unixTimestamp
        blockTimeSum = blockTimeSum + blockTime

        if (blockTime > maxAllowedBlocktime || blockTime < minAllowedBlocktime) {
          numberOfDeviatedBlocks += 1
        }
      }
      lastBlockTimeStamp = block.unixTimestamp
    }
    const numberOfBlocksAnalyzed = includesGenesis ? latestBlocks.length - 2 : latestBlocks.length - 1
    const averageBlockTime = blockTimeSum / numberOfBlocksAnalyzed
    const isHealthy =
      averageBlockTime >= minAllowedAverageBlocktime &&
      averageBlockTime <= maxAllowedAverageBlocktime &&
      numberOfDeviatedBlocks <= allowedNumberDeviatedBlocks

    const blockTimeHealth: BlockTimeHealth = {
      averageBlockTime,
      endBlockNumber,
      isHealthy,
      numberOfBlocksAnalyzed,
      numberOfDeviatedBlocks,
      startBlockNumber
    }

    return blockTimeHealth
  } catch (error) {
    logger.error('Failed to calculate BlockTimeHealth')
    return null
  }
}
