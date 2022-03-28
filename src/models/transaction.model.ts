import { Document, model, Types, Schema } from 'mongoose'

import { Transaction } from '../interfaces/transaction.interface'

const transactionSchema: Schema = new Schema(
  {
    hash: {
      type: String,
      required: true
    },
    blockNumber: {
      type: Number,
      required: true
    },
    unixTimestamp: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      required: true,
      set: d => new Date(d * 1000)
    },
    fromAddress: {
      type: String,
      required: true
    },
    toAddress: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true
  }
)

// Make sure there are no duplicates (each publicKey once per list)
//transactionSchema.index({ publicKey: 1, list_id: 1 }, { unique: true })

const Transaction = model<Transaction & Document>('Transaction', transactionSchema)

export default Transaction
