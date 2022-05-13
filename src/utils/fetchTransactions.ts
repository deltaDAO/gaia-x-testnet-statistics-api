import { ethers } from 'ethers'
import { IBlock } from 'interfaces/block.interface'
import { Transaction as TransactionI } from 'interfaces/transaction.interface'
import Block from '../models/block.model'
import Transaction from '../models/transaction.model'
import { logger } from './logger'
import { getDateFromUnixTimestamp } from './util'

const providerURL = process.env.PROVIDER_URL || 'https://rpc.gaiaxtestnet.oceanprotocol.com' // or use your local node 'http://localhost:8545'
const provider = new ethers.providers.JsonRpcProvider(providerURL)

async function getLatestTxBlockNumber() {
  const txArray = await Transaction.find().sort({ blockNumber: -1 }).limit(1)
  return txArray?.[0]?.blockNumber
}

async function saveTransaction(transaction: TransactionI) {
  Transaction.create(transaction)
}

export async function fetchTransactions() {
  logger.info('==== Start Transaction import ====')
  try {
    const blockQuery: any = { transactionHashes: { $exists: true, $not: { $size: 0 } } }
    const latestTxBlockNumber = await getLatestTxBlockNumber()

    if (latestTxBlockNumber) {
      blockQuery.blockNumber = { $gt: latestTxBlockNumber }
    } else {
      logger.warn('Failed to query latestTxBlockNumber. Start from 0')
    }

    let blocksWithTransactions: IBlock[]
    try {
      blocksWithTransactions = await Block.find(blockQuery)
    } catch (error) {
      logger.error(`Failed to query blocks from db. Error is: ${error}`)
    }

    for (const block of blocksWithTransactions) {
      const { unixTimestamp, transactionHashes }: { unixTimestamp: number; transactionHashes: string[] } = block

      for (const txHash of transactionHashes) {
        const transaction = await provider.getTransaction(txHash)
        if (!transaction) {
          logger.warn(`Tried to get transaction with txHash ${txHash} from provider. Result is : ${transaction}`)
          continue
        }
        const { hash, blockNumber, from, to }: { hash: string; blockNumber?: number; from: string; to?: string } = transaction

        logger.info(`Fetch Transaction: ${hash} Block: ${blockNumber}`)

        await saveTransaction({
          hash,
          blockNumber,
          unixTimestamp,
          timestamp: getDateFromUnixTimestamp(unixTimestamp),
          fromAddress: from,
          toAddress: to
        })
      }
    }
  } catch (error) {
    logger.error(error)
  }
  logger.info('==== Finished Transaction import ====')
}
