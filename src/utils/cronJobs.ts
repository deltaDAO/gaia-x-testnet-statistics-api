import * as cron from 'node-cron'
import { fetchBlockchainData } from './fetchBlockchainData'
import { logger } from './logger'

export function startCronJobs() {
  let isFetching = false
  /**
   * try to start fetchBlockchainData every minute
   */
  cron.schedule('* * * * *', async () => {
    if (!isFetching) {
      isFetching = true
      logger.info('==== start fetchBlockchainData (cron) ====')
      await fetchBlockchainData()
      logger.info('==== finished fetchBlockchainData (cron) ====')
      isFetching = false
    }
  })
}
