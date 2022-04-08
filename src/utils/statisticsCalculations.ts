import Block from '../models/block.model'
import CreateTokenEvent from '../models/createTokenEvent.model'
import Statistic from '../models/statistic.model'
import Transaction from '../models/transaction.model'
import _ from 'lodash'
import { format, getWeek } from 'date-fns'
import { logger } from './logger'
import { Statistic as StatisticI } from 'interfaces/statistic.interface'
import { Transaction as TransactionI } from 'interfaces/transaction.interface'

async function getTotalWalletAddresses() {
  const accountSet = new Set()
  const transactions = await Transaction.find({})
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

  const lastYearTransactions = await Transaction.find({ timestamp: { $gte: queryDate } }).exec()

  const groupedBySelection: { [key: string]: TransactionI[] } = _.groupBy(lastYearTransactions, tx => {
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

async function saveStatistic(statistic: StatisticI) {
  Statistic.create(statistic)
}

export async function calculateStatistics() {
  logger.info('==== start building statistics ====')
  const totalBlocks = await Block.countDocuments({})

  const totalTransactions = await Transaction.countDocuments({})
  const totalWalletAddresses = await getTotalWalletAddresses()
  const totalAssets = await CreateTokenEvent.countDocuments({})

  const totalTransactionsChartData: any = {}
  totalTransactionsChartData.groupedByDay = await getTotalTransactionsChartData()
  totalTransactionsChartData.groupedByWeek = await getTotalTransactionsChartData('week')
  totalTransactionsChartData.groupedByMonth = await getTotalTransactionsChartData('month')

  const statistic: StatisticI = { totalBlocks, totalTransactions, totalWalletAddresses, totalAssets, totalTransactionsChartData }
  await saveStatistic(statistic)
  logger.info('==== finished building statistics ====')
}
