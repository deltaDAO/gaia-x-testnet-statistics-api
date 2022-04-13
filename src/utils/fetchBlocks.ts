import { ethers } from 'ethers'
import { Block as BlockI } from 'interfaces/block.interface'
import Block from '../models/block.model'
import { logger } from './logger'
import { getDateFromUnixTimestamp } from './util'

const providerURL = process.env.PROVIDER_URL || 'https://rpc.gaiaxtestnet.oceanprotocol.com' // or use your local node 'http://localhost:8545'
const provider = new ethers.providers.JsonRpcProvider(providerURL)

async function getLatestBlockNumber() {
  const latestBlock = await provider.getBlock('latest')
  return latestBlock.number
}

async function getLatestBlockNumberFromDb() {
  const blockArray = await Block.findOne({}).sort('-blockNumber').exec()
  return blockArray?.blockNumber
}

function getBlock(blockNumber) {
  return provider.getBlock(blockNumber)
}

async function saveBlocks(blocks: BlockI[]) {
  Block.insertMany(blocks)
}

export async function fetchBlocks(bundleSize: number) {
  logger.info('==== Start Block import ====')
  try {
    const latestBlockNumberInDb = await getLatestBlockNumberFromDb()
    const latestBlockNumber = await getLatestBlockNumber()

    if (latestBlockNumber === undefined) {
      logger.error(`Failed to query latestBlockNumber.`)
      return
    }

    logger.info(`Latest Block in DB: ${latestBlockNumberInDb} Lastest Block: ${latestBlockNumber}`)

    let blockArray = []
    let blockNumberStart = latestBlockNumberInDb ? latestBlockNumberInDb + 1 : 0
    let blockNumberEnd = blockNumberStart + bundleSize - 1

    for (let currentBlockNumber = blockNumberStart; currentBlockNumber < latestBlockNumber; currentBlockNumber++) {
      if (currentBlockNumber > blockNumberEnd) {
        const newBlockNumberEnd = blockNumberEnd + bundleSize
        await saveBlocks(blockArray)
        logger.info(`blocks saved to DB (bundle size: ${bundleSize})`)
        blockArray = []

        blockNumberStart = blockNumberStart + bundleSize
        blockNumberEnd = newBlockNumberEnd > latestBlockNumber ? latestBlockNumber : newBlockNumberEnd
      }

      const newBlock = await getBlock(currentBlockNumber)

      const { number, timestamp, transactions }: { number: number; timestamp: number; transactions: string[] } = newBlock

      logger.info(`Fetch Block: ${number.toLocaleString('en-US')} / ${latestBlockNumber.toLocaleString('en-US')}`)

      blockArray.push({
        blockNumber: number,
        unixTimestamp: timestamp,
        timestamp: getDateFromUnixTimestamp(timestamp),
        transactionHashes: transactions
      })
    }
    await saveBlocks(blockArray)
    logger.info(`blocks saved to DB (bundle size: ${bundleSize})`)
  } catch (error) {
    logger.error(error)
  }
  logger.info('==== Finished Block import ====')
}
