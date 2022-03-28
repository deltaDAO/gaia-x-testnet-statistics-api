import { HttpException } from '../exceptions/HttpException'
import Statistic from '../models/statistic.model'

class StatisticService {
  public statistic = Statistic

  public async findStatistic() {
    const latestStatistic = await this.statistic.find({}).sort('-_id').limit(1).exec()

    if (!latestStatistic[0]) throw new HttpException(409, 'Statistic not found.')

    const { totalBlocks, totalTransactions, totalWalletAddresses, totalAssets, totalTransactionsChartData } = latestStatistic[0]
    return {
      totalBlocks,
      totalTransactions,
      totalWalletAddresses,
      totalAssets,
      totalTransactionsChartData
    }
  }
}

export default StatisticService
