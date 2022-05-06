import Block from '../models/block.model'
import { Block as IBlock } from 'interfaces/block.interface'

export function getLatestBlocks(numberOfBlocks: number): Promise<IBlock[]> {
  return Block.find({}).sort({ blockNumber: -1 }).limit(numberOfBlocks).exec()
}
