import { Document, model, Types, Schema } from 'mongoose'

import { Statistic } from '../interfaces/statistic.interface'

const StatisticSchema: Schema = new Schema(
  {
    totalTransactions: {
      type: Number
    },
    totalBlocks: {
      type: Number,
      required: true
    },
    totalWalletAddresses: {
      type: Number
    },
    totalAssets: {
      type: Number
    },
    lastAnalyzedBlock: {
      type: Number
    },
    totalTransactionsChartData: {
      type: Object
    }
  },
  {
    timestamps: true
  }
)

// Make sure there are no duplicates (each publicKey once per list)
//StatisticSchema.index({ publicKey: 1, list_id: 1 }, { unique: true })

const Statistic = model<Statistic & Document>('Statistic', StatisticSchema)

export default Statistic
