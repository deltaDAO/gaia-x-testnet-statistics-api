import * as cron from 'node-cron'
import { fetchBlockchainData } from './fetchBlockchainData'
import { logger } from './logger'
import { checkNetworkHealth } from './networkHealth'

export function startCronJobs() {
  let isFetching = false
  let healthCheckRunning = false

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

  /**
   * check network health every hour
   */
  if (process.env.SLACK_WEBHOOK_SECRET_URL) {
    cron.schedule('0 * * * *', async () => {
      // TODO change to hour
      if (!healthCheckRunning) {
        healthCheckRunning = true
        logger.info('==== start health check (cron) ====')
        await checkNetworkHealth()
        logger.info('==== finished health check (cron) ====')
        healthCheckRunning = false
      }
    })
  }
}
