import Block from '../models/block.model'
import CreateTokenEvent from '../models/createTokenEvent.model'
import Statistic from '../models/statistic.model'
import Transaction from '../models/transaction.model'
import _ from 'lodash'
import { format, getWeek } from 'date-fns'

async function getTotalWalletAddresses() {
  const accountSet = new Set()
  const transactions = await Transaction.find({})
  for (const tx of transactions) {
    accountSet.add(tx.fromAddress)
    accountSet.add(tx.toAddress)
  }
  return accountSet.size
}

async function getTotalTransactionsChartData(groupBy) {
  const queryDate = new Date()
  const oneYearAgo = queryDate.getDate() - 365 // 365 days in the past
  queryDate.setDate(oneYearAgo)
  queryDate.setHours(0, 0, 0, 0)

  const lastYearTransactions = await Transaction.find({ timestamp: { $gte: queryDate } }).exec()

  const groupedBySelection = _.groupBy(lastYearTransactions, tx => {
    return groupBy === 'month'
      ? format(new Date(tx.unixTimestamp * 1000), 'MM.yyyy')
      : groupBy === 'week'
      ? `${getWeek(new Date(tx.unixTimestamp * 1000), {
          weekStartsOn: 1
        })}.${format(new Date(tx.unixTimestamp * 1000), 'yyyy')}`
      : format(new Date(tx.unixTimestamp * 1000), 'dd.MM.yyyy')
  })

  const timeStamps = Object.keys(groupedBySelection)
  const overallValues = Object.values(groupedBySelection).map(group => group.reduce((pv, cv) => (pv += 1), 0))

  return { timeStamps, overallValues }
}

export async function calculateStatistics() {
  console.log('==== start building statistics ====')
  const blocksWithTransactions = await Block.find({ transactionHashes: { $exists: true, $not: { $size: 0 } } })
  const totalBlocks = await Block.countDocuments({})

  const totalTransactions = await Transaction.countDocuments({})
  const totalWalletAddresses = await getTotalWalletAddresses(blocksWithTransactions)
  const totalAssets = await CreateTokenEvent.countDocuments({})

  const totalTransactionsChartData = {}
  totalTransactionsChartData.groupedByDay = await getTotalTransactionsChartData()
  totalTransactionsChartData.groupedByWeek = await getTotalTransactionsChartData('week')
  totalTransactionsChartData.groupedByMonth = await getTotalTransactionsChartData('month')

  //console.log(totalBlocks, totalTransactions, totalWalletAddresses, totalAssets, totalTransactionsChartData)

  Statistic.create({ totalBlocks, totalTransactions, totalWalletAddresses, totalAssets, totalTransactionsChartData })
  console.log('==== finished building statistics ====')
}
