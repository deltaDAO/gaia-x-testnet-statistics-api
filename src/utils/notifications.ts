import { NetworkHealth } from 'interfaces/networkHealth.interface'
import slack from '../services/slack.service'

export function networkHealthNotification(networkHealth: NetworkHealth) {
  const { averageBlockTime, numberOfDeviatedBlocks, startBlockNumber, endBlockNumber, numberOfBlocksAnalyzed } = networkHealth.blockTimeHealth

  const unhealthyMessage = `⚠️WARNING: Unusual testnet metrics detected \n\nNetwork state: unhealthy 🤒
Average Blocktime: ${averageBlockTime} seconds \nNumber of deviated Blocks: ${numberOfDeviatedBlocks}
Number of Blocks analyzed: ${numberOfBlocksAnalyzed} \nStartblock: ${startBlockNumber} \nEndblock: ${endBlockNumber}`

  slack.sendNotification(unhealthyMessage)
}