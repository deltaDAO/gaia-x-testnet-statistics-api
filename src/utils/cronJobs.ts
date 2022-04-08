import * as cron from 'node-cron'
import { fetchBlockchainData } from './fetchBlockchainData'
import { logger } from './logger'

export async function startFetchBlockchainDataCronJob() {
  /**
   * start fetchBlockchainData every 15 minutes
   */
  cron.schedule('0,15,30,45 * * * *', () => {
    logger.info('==== start fetchBlockchainData (cron) ====')
    fetchBlockchainData()
  })
}
