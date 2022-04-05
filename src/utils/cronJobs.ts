import * as cron from 'node-cron'
import { fetchBlockchainData } from './fetchBlockchainData'
import { logger } from './logger'

export async function startCronJobs() {
  /**
   * initial querying of the node data to prevent too long imports in the cronjob
   */
  await fetchBlockchainData()
  /**
   * start fetchBlockchainData every 15 minutes
   */
  cron.schedule('0,15,30,45 * * * *', () => {
    logger.info('==== start fetchBlockchainData (cron) ====')
    fetchBlockchainData()
  })
}
