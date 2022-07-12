import { ethers } from 'ethers'
import { IBlock } from 'interfaces/block.interface'
import Block from '../models/block.model'
import { logger } from './logger'
import { getDateFromUnixTimestamp } from '.'

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

async function saveBlocks(blocks: IBlock[]) {
  Block.insertMany(blocks)
}

export async function fetchBlocks(bundleSize: number) {
  logger.info('==== Start Block import ====')
  try {
    const latestBlockNumberInDb = await getLatestBlockNumberFromDb()
    const latestBlockNumber = await getLatestBlockNumber()
    const confirmationSafetyBuffer = 25 // number of latest blocks that will not be fetched because of insufficient confirmations
    if (latestBlockNumber === undefined) {
      logger.error(`Failed to query latestBlockNumber.`)
      return
    }
    const latestSafeBlock = latestBlockNumber - confirmationSafetyBuffer

    logger.info(
      `Latest Block in DB: ${latestBlockNumberInDb} Lastest safe Block: ${latestSafeBlock} (confirmationSafetyBuffer: ${confirmationSafetyBuffer} blocks)`
    )

    let blockArray = []
    let blockNumberStart = latestBlockNumberInDb ? latestBlockNumberInDb + 1 : 0
    let blockNumberEnd = blockNumberStart + bundleSize - 1

    for (let currentBlockNumber = blockNumberStart; currentBlockNumber < latestSafeBlock; currentBlockNumber++) {
      if (currentBlockNumber > blockNumberEnd) {
        const newBlockNumberEnd = blockNumberEnd + bundleSize
        await saveBlocks(blockArray)
        logger.info(`blocks saved to DB (bundle size: ${bundleSize})`)
        blockArray = []

        blockNumberStart = blockNumberStart + bundleSize
        blockNumberEnd = newBlockNumberEnd > latestSafeBlock ? latestSafeBlock : newBlockNumberEnd
      }

      const newBlock = await getBlock(currentBlockNumber)

      const { number, timestamp, transactions }: { number: number; timestamp: number; transactions: string[] } = newBlock

      logger.info(`Fetch Block: ${number.toLocaleString('en-US')} / ${latestSafeBlock.toLocaleString('en-US')}`)

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
