import { fetchBlocks } from './fetchBlocks'
import { getEvents } from './fetchCreateTokenEvents'
import { calculateStatistics } from './statisticsCalculations'
import { fetchTransactions } from './fetchTransactions'

export async function queryTestnet() {
  await fetchBlocks()
  await getEvents()
  await fetchTransactions()
  await calculateStatistics()
}
