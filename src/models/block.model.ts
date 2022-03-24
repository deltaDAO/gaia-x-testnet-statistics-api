import { Document, model, Types, Schema } from 'mongoose'

import { Block } from '../interfaces/block.interface'

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
      required: true,
      set: d => new Date(d * 1000)
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

// Make sure there are no duplicates (each publicKey once per list)
//blockSchema.index({ publicKey: 1, list_id: 1 }, { unique: true })

const Block = model<Block & Document>('Block', blockSchema)

export default Block
