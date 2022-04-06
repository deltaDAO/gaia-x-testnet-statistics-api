export interface CreateTokenEvent {
  _id: string
  blockNumber: number
  unixTimestamp: number
  timestamp: Date
  transactionHash: string
  createdAt: Date
  updatedAt: Date
}
