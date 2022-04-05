export interface CreateTokenEvent {
  _id: string
  blockNumber: number
  unixTimestamp: number
  timestamp: Date | number
  transactionHash: string
  createdAt: Date
  updatedAt: Date
}
