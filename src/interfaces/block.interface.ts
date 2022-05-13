export interface IBlock {
  _id?: string
  blockNumber: number
  unixTimestamp: number
  timestamp: Date
  transactionHashes: string[]
  createdAt?: Date
  updatedAt?: Date
}
