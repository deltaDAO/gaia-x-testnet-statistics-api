import { Document, model, Schema } from 'mongoose'

import { IStatistic } from '../interfaces/statistic.interface'

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

const Statistic = model<IStatistic & Document>('Statistic', StatisticSchema)

export default Statistic
