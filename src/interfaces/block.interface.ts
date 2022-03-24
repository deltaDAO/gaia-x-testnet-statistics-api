export interface Block {
  _id: string
  blockNumber: number
  unixTimestamp: number
  timestamp: Date
  transactionHashes: string[]
  createdAt: Date
  updatedAt: Date
}
