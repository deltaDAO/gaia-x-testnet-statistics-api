import { fetchBlocks } from './fetchBlocks'
import { getTokenCreatedEvents } from './fetchCreateTokenEvents'
import { calculateStatistics } from './statisticsCalculations'
import { fetchTransactions } from './fetchTransactions'
const bundleSize = process.env.BUNDLE_SIZE ? parseInt(process.env.BUNDLE_SIZE) : 1000

export async function fetchBlockchainData() {
  // await fetchBlocks(bundleSize) // save to db every 1000 blocks
  // await getTokenCreatedEvents()
  // await fetchTransactions()
  await calculateStatistics()
}
