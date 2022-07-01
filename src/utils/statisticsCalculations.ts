import Block from '../models/block.model'
import CreateTokenEvent from '../models/createTokenEvent.model'
import Statistic from '../models/statistic.model'
import Transaction from '../models/transaction.model'
import _ from 'lodash'
import { format, getWeek } from 'date-fns'
import { logger } from './logger'
import { IStatistic } from 'interfaces/statistic.interface'
import { ITransaction } from 'interfaces/transaction.interface'

const EXCLUDED_TO_ADDRESSES = process.env.STATISTICS_EXCLUDED_TO_ADDRESSES?.split(',') ?? [] // exclude specific toAdresses from statistics

async function getTotalWalletAddresses() {
  const accountSet = new Set()
  const transactions = await Transaction.find({ toAddress: { $nin: EXCLUDED_TO_ADDRESSES } })
  for (const tx of transactions) {
    accountSet.add(tx.fromAddress)
    accountSet.add(tx.toAddress)
  }
  return accountSet.size
}

async function getTotalTransactionsChartData(groupBy = null) {
  const queryDate = new Date()
  const oneYearAgo = queryDate.getDate() - 365 // 365 days in the past
  queryDate.setDate(oneYearAgo)
  queryDate.setHours(0, 0, 0, 0)

  const lastYearTransactions = await Transaction.find({
    toAddress: { $nin: EXCLUDED_TO_ADDRESSES },
    timestamp: { $gte: queryDate }
  }).exec()

  const groupedBySelection: { [key: string]: ITransaction[] } = _.groupBy(lastYearTransactions, tx => {
    return groupBy === 'month'
      ? format(new Date(tx.unixTimestamp * 1000), 'MM.yyyy')
      : groupBy === 'week'
      ? `${getWeek(new Date(tx.unixTimestamp * 1000), {
          weekStartsOn: 1
        })}.${format(new Date(tx.unixTimestamp * 1000), 'yyyy')}`
      : format(new Date(tx.unixTimestamp * 1000), 'dd.MM.yyyy')
  })

  const timeStamps = Object.keys(groupedBySelection)
  const overallValues = Object.values(groupedBySelection).map(group => (group ? group.reduce((pv, cv) => (pv += 1), 0) : 0))

  return { timeStamps, overallValues }
}

async function saveStatistic(statistic: IStatistic) {
  Statistic.create(statistic)
}

export async function calculateStatistics() {
  logger.info('==== start building statistics ====')
  const totalBlocks = await Block.countDocuments({})

  const totalTransactions = await Transaction.countDocuments({ toAddress: { $nin: EXCLUDED_TO_ADDRESSES } })
  const totalWalletAddresses = await getTotalWalletAddresses()
  const totalAssets = await CreateTokenEvent.countDocuments({})

  const totalTransactionsChartData: any = {}
  totalTransactionsChartData.groupedByDay = await getTotalTransactionsChartData()
  totalTransactionsChartData.groupedByWeek = await getTotalTransactionsChartData('week')
  totalTransactionsChartData.groupedByMonth = await getTotalTransactionsChartData('month')

  const statistic: IStatistic = { totalBlocks, totalTransactions, totalWalletAddresses, totalAssets, totalTransactionsChartData }
  await saveStatistic(statistic)
  logger.info('==== finished building statistics ====')
}
