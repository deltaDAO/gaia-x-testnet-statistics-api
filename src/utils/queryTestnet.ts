import { fetchBlocks } from './fetchBlocks'
import { getTokenCreatedEvents } from './fetchCreateTokenEvents'
import { calculateStatistics } from './statisticsCalculations'
import { fetchTransactions } from './fetchTransactions'

export async function queryTestnet() {
  await fetchBlocks()
  await getTokenCreatedEvents()
  await fetchTransactions()
  await calculateStatistics()
}
