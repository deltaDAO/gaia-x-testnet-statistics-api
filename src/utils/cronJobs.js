import * as cron from 'node-cron'
import { queryTestnet } from './queryTestnet'

export async function startCronJobs() {
  /**
   * initial querying of the node data to prevent to long imports in the cronjob
   */
  await queryTestnet()
  /**
   * Lock printStatus updates and emit status to send shipping confirmation
   */
  cron.schedule('0,15,30,45 * * * *', () => {
    console.log('==== start queryTestnet (cron) ====')
    queryTestnet()
  })
}
