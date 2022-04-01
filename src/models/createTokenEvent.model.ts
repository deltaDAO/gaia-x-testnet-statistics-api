import { Document, model, Schema } from 'mongoose'

import { CreateTokenEvent } from '../interfaces/createTokenEvent.interface'

const createTokenEventSchema: Schema = new Schema(
  {
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
    transactionHash: {
      type: String,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
)

// Make sure there are no duplicates (each publicKey once per list)
//createTokenEventSchema.index({ publicKey: 1, list_id: 1 }, { unique: true })

const CreateTokenEvent = model<CreateTokenEvent & Document>('CreateTokenEvent', createTokenEventSchema)

export default CreateTokenEvent
