export interface ITransaction {
  _id?: string
  hash: string
  blockNumber: number
  unixTimestamp: number
  timestamp: Date
  fromAddress: string
  toAddress: string
  createdAt?: Date
  updatedAt?: Date
}
