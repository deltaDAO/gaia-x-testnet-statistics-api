import { Document, model, Schema } from 'mongoose'

import { IBlock } from '../interfaces/block.interface'

const blockSchema: Schema = new Schema(
  {
    blockNumber: {
      type: Number,
      required: true,
      unique: true
    },
    unixTimestamp: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      required: true
    },
    transactionHashes: {
      type: [String],
      required: false
    }
  },
  {
    timestamps: true
  }
)

const Block = model<IBlock & Document>('Block', blockSchema)

export default Block
