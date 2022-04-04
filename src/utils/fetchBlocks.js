import { ethers } from 'ethers'
import Block from '../models/block.model'
import fetch from 'node-fetch'
import { logger } from './logger'

const providerURL = process.env.PROVIDER_URL || 'https://rpc.gaiaxtestnet.oceanprotocol.com' // or use your local node 'http://localhost:8545'
const provider = new ethers.providers.JsonRpcProvider(providerURL)

function getLatestBlockNumber() {
  return fetch('https://exchangelog.minimal-gaia-x.eu/chain-blocks', {
    credentials: 'omit',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:98.0) Gecko/20100101 Firefox/98.0',
      Accept: 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'en-US,en;q=0.5',
      'X-Requested-With': 'XMLHttpRequest',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-GPC': '1',
      'Cache-Control': 'max-age=0'
    },
    referrer: 'https://exchangelog.minimal-gaia-x.eu/',
    method: 'GET',
    mode: 'cors'
  })
    .then(response => response.json())
    .then(data => data.blocks[0].block_number)
}

async function getLatestBlockNumberFromDb() {
  const blockArray = await Block.find({}).sort('-blockNumber').limit(1).exec()
  return blockArray === [] ? null : blockArray[0].blockNumber
}

function getBlock(blockNumber) {
  return provider.getBlock(blockNumber)
}

export async function fetchBlocks() {
  logger.info('==== Start Block import ====')
  try {
    const bundleSize = 10000
    const latestBlockNumberInDb = await getLatestBlockNumberFromDb()
    const lastBlock = await getLatestBlockNumber()
    logger.info(`Latest Block in DB: ${latestBlockNumberInDb} Lastest Block: ${lastBlock}`)
    let blockArray = []
    let blockNumberStart = latestBlockNumberInDb ? latestBlockNumberInDb + 1 : 0
    let blockNumberEnd = blockNumberStart + bundleSize

    for (let currentBlockNumber = blockNumberStart; currentBlockNumber < lastBlock; currentBlockNumber++) {
      if (currentBlockNumber > blockNumberEnd) {
        await Block.insertMany(blockArray)
        blockArray = []
        blockNumberStart = blockNumberStart + bundleSize
        if (blockNumberEnd + bundleSize > lastBlock) {
          blockNumberEnd = lastBlock
        } else {
          blockNumberEnd = blockNumberEnd + bundleSize
        }
      }

      const newBlock = await getBlock(currentBlockNumber)
      logger.info(`Fetch Block: ${newBlock.number}`)
      blockArray.push({
        blockNumber: newBlock.number,
        unixTimestamp: newBlock.timestamp,
        timestamp: newBlock.timestamp,
        transactionHashes: newBlock.transactions
      })
    }
    await Block.insertMany(blockArray)
  } catch (error) {
    logger.error(error)
  }
  logger.info('==== Finished Block import ====')
}
