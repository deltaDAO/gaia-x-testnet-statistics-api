import { fetchBlocks } from './fetchBlocks'
import { getTokenCreatedEvents } from './fetchCreateTokenEvents'
import { calculateStatistics } from './statisticsCalculations'
import { fetchTransactions } from './fetchTransactions'

export async function fetchBlockchainData() {
  await fetchBlocks(10000) // save every 10000 Blocks to DB
  await getTokenCreatedEvents()
  await fetchTransactions()
  await calculateStatistics()
}
