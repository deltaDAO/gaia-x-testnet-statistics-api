import Block from '../models/block.model'
import CreateTokenEvent from '../models/createTokenEvent.model'
import Statistic from '../models/statistic.model'
import Transaction from '../models/transaction.model'
import { getWeek, getYear, parse } from 'date-fns'
import { logger } from './logger'
import { IStatistic } from 'interfaces/statistic.interface'
import { generateArrayOfPastMonths, generateArrayOfPastWeeks, generateArrayOfPastDays } from '.'

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

async function getTotalTransactionsChartData(): Promise<object> {
  const queryDate = new Date()
  const oneYearAgo = queryDate.getDate() - 365 // 365 days in the past
  queryDate.setDate(oneYearAgo)
  queryDate.setHours(0, 0, 0, 0)

  const amountTxByDay = await Transaction.aggregate([
    { $match: { toAddress: { $nin: EXCLUDED_TO_ADDRESSES }, timestamp: { $gte: queryDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%d.%m.%Y', date: '$timestamp' } },
        count: { $sum: 1 }
      }
    }
  ])
  const amountTxByMonth = await Transaction.aggregate([
    { $match: { toAddress: { $nin: EXCLUDED_TO_ADDRESSES }, timestamp: { $gte: queryDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%m.%Y', date: '$timestamp' } },
        count: { $sum: 1 }
      }
    }
  ])

  const dateLabels = generateArrayOfPastDays(365) // dd.MM.yyyy
  const weekLabels = generateArrayOfPastWeeks(52) // {1-52}.yyyy
  const monthLabels = generateArrayOfPastMonths(12) // mm.yyyy
  const completeTxsByDay = []
  const completeTxsByWeek = []
  const completeTxsByMonth = []

  for (const dateLabel of dateLabels) {
    const indexMatchingDate = amountTxByDay.findIndex(day => day._id === dateLabel)
    completeTxsByDay.push(indexMatchingDate === -1 ? 0 : amountTxByDay[indexMatchingDate].count)
  }
  for (const monthLabel of monthLabels) {
    const indexMatchingMonth = amountTxByMonth.findIndex(month => month._id === monthLabel)
    completeTxsByMonth.push(indexMatchingMonth === -1 ? 0 : amountTxByMonth[indexMatchingMonth].count)
  }

  const txByWeekNumber = {}
  for (const day of amountTxByDay) {
    const date = parse(day._id, 'dd.MM.yyyy', new Date())
    const weekNumber = getWeek(date)
    const year = getYear(date)
    txByWeekNumber[`${weekNumber}.${year}`] = txByWeekNumber[`${weekNumber}.${year}`]
      ? txByWeekNumber[`${weekNumber}.${year}`] + day.count
      : day.count
  }
  for (const weekLabel of weekLabels) {
    completeTxsByWeek.push(txByWeekNumber[weekLabel] ? txByWeekNumber[weekLabel] : 0)
  }

  return {
    groupedByDay: { timeStamps: dateLabels, overallValues: completeTxsByDay },
    groupedByWeek: { timeStamps: weekLabels, overallValues: completeTxsByWeek },
    groupedByMonth: { timeStamps: monthLabels, overallValues: completeTxsByMonth }
  }
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

  const totalTransactionsChartData = await getTotalTransactionsChartData()

  const statistic: IStatistic = { totalBlocks, totalTransactions, totalWalletAddresses, totalAssets, totalTransactionsChartData }
  await saveStatistic(statistic)
  logger.info('==== finished building statistics ====')
}
