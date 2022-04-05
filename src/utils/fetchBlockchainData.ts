import { fetchBlocks } from './fetchBlocks'
import { getTokenCreatedEvents } from './fetchCreateTokenEvents'
import { calculateStatistics } from './statisticsCalculations'
import { fetchTransactions } from './fetchTransactions'

export async function fetchBlockchainData() {
  await fetchBlocks()
  await getTokenCreatedEvents()
  await fetchTransactions()
  await calculateStatistics()
}
