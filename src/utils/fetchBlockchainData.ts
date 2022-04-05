import { fetchBlocks } from './fetchBlocks'
import { getTokenCreatedEvents } from './fetchCreateTokenEvents'
import { calculateStatistics } from './statisticsCalculations'
import { fetchTransactions } from './fetchTransactions'
import { startFetchBlockchainDataCronJob } from './cronJobs'
const bundleSize = process.env.BUNDLE_SIZE ? parseInt(process.env.BUNDLE_SIZE) : 1000

export async function startFetchBlockchainData() {
  await fetchBlockchainData() // initial querying of the node data to prevent too long imports in the cronjob
  startFetchBlockchainDataCronJob() // start cronjob after initial data fetching
}

export async function fetchBlockchainData() {
  await fetchBlocks(bundleSize) // save to db every 10000 blocks
  await getTokenCreatedEvents()
  await fetchTransactions()
  await calculateStatistics()
}