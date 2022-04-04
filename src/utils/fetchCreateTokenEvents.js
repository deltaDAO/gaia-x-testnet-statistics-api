const ethers = require('ethers')
const gaiaxUrl = 'https://rpc.gaiaxtestnet.oceanprotocol.com:443'
const provider = new ethers.providers.JsonRpcProvider(gaiaxUrl)
const { abi, contractAddress } = require('./dtfactory.json')
import CreateTokenEvent from '../models/createTokenEvent.model'
import Block from '../models/block.model'
import { logger } from './logger'

async function getLatestEventBlockNumberFromDb() {
  const eventArray = await CreateTokenEvent.find({}).sort('-blockNumber').limit(1).exec()
  return eventArray === [] ? null : eventArray[0].blockNumber
}

export async function getEvents() {
  logger.info('==== Start event import ====')
  const contract = new ethers.Contract(contractAddress, abi, provider)

  const filter = 'TokenCreated'
  const startBlock = await getLatestEventBlockNumberFromDb()
  const endBlock = 'latest'
  const events = await contract.queryFilter(filter, startBlock, endBlock)

  const cleanedEvents = []
  for (const event of events) {
    const existingEvent = await CreateTokenEvent.findOne({ transactionHash: event.transactionHash })
    if (existingEvent) {
      if (!(existingEvent.unixTimestamp === 1234567890)) {
        continue
      }
      const eventBlock = await Block.findOne({ blockNumber: event.blockNumber })
      await CreateTokenEvent.findByIdAndUpdate(
        { _id: existingEvent._id },
        { unixTimestamp: eventBlock ? eventBlock.unixTimestamp : 1234567890, timestamp: eventBlock ? eventBlock.unixTimestamp : 1234567890 }
      )
      continue
    }

    const eventBlock = await Block.findOne({ blockNumber: event.blockNumber })

    cleanedEvents.push({
      blockNumber: event.blockNumber,
      unixTimestamp: eventBlock ? eventBlock.unixTimestamp : 1234567890,
      timestamp: eventBlock ? eventBlock.unixTimestamp : 1234567890,
      transactionHash: event.transactionHash
    })
  }

  await CreateTokenEvent.insertMany(cleanedEvents)
  logger.info('==== Finished event import ====')
}
