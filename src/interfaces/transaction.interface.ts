export interface Transaction {
  _id: string
  hash: string
  blockNumber: number
  unixTimestamp: number
  timestamp: Date
  fromAddress: string
  toAddress: string
  createdAt: Date
  updatedAt: Date
}
