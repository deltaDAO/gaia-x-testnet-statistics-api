import { ethers } from 'ethers'
import Block from '../models/block.model'
import Transaction from '../models/transaction.model'

const providerURL = `https://rpc.gaiaxtestnet.oceanprotocol.com` // or use your local node 'http://localhost:8545'
const provider = new ethers.providers.JsonRpcProvider(providerURL)

async function getLatestTransactionBlock() {
  const txArray = await Transaction.find({}).sort('-blockNumber').limit(1).exec()
  return txArray === [] ? null : txArray[0].blockNumber
}

export async function fetchTransactions() {
  console.log(' ==== Start Transaction import ====')
  const blockQuery = { transactionHashes: { $exists: true, $not: { $size: 0 } } }
  const lastTxBlockNumber = await getLatestTransactionBlock()
  if (lastTxBlockNumber) {
    blockQuery.blockNumber = { $gt: lastTxBlockNumber }
  }
  const blocksWithTransactions = await Block.find(blockQuery)

  for (const block of blocksWithTransactions) {
    for (let index = 0; index < block.transactionHashes.length; index++) {
      const txHash = block.transactionHashes[index]
      const transaction = await provider.getTransaction(txHash)
      console.log('Fetch Transaction:', transaction.hash, 'Block:', transaction.blockNumber)
      await Transaction.create({
        hash: transaction.hash,
        blockNumber: transaction.blockNumber,
        unixTimestamp: block.unixTimestamp,
        timestamp: block.unixTimestamp,
        fromAddress: transaction.from,
        toAddress: transaction.to
      })
    }
  }
  console.log(' ==== Finished Transaction import ====')
}
