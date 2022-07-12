export interface IStatistic {
  _id?: string
  totalTransactions: number
  totalBlocks: number
  totalWalletAddresses: number
  totalAssets: number
  totalTransactionsChartData: Object
  createdAt?: Date
  updatedAt?: Date
}

export interface StatisticResponse {
  totalTransactions: number
  totalBlocks: number
  totalWalletAddresses: number
  totalAssets: number
  totalTransactionsChartData: Object
  createdAt: Date
}
