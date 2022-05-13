import * as cron from 'node-cron'
import { fetchBlockchainData } from './fetchBlockchainData'
import { logger } from './logger'
import { checkNetworkHealth } from './networkHealth'

export function startCronJobs() {
  let isFetching = false
  let isHealthCheckRunning = false

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
   * set FF_NOTIFY_HEALTH_SLACK to true in .env to enable
   * SLACK_WEBHOOK_SECRET_URL needed
   */
  if (process.env.FF_NOTIFY_HEALTH_SLACK) {
    cron.schedule('0 * * * *', async () => {
      if (!isHealthCheckRunning) {
        isHealthCheckRunning = true
        logger.info('==== start health check (cron) ====')
        await checkNetworkHealth()
        logger.info('==== finished health check (cron) ====')
        isHealthCheckRunning = false
      }
    })
  }
}
