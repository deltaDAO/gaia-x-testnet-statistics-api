const ethers = require('ethers')
const gaiaxUrl = 'https://rpc.gaiaxtestnet.oceanprotocol.com:443'
const provider = new ethers.providers.JsonRpcProvider(gaiaxUrl)
const { abi, contractAddress } = require('./dtfactory.json')
import CreateTokenEvent from '../models/createTokenEvent.model'
import Block from '../models/block.model'
import { logger } from './logger'
import { getDateFromUnixTimestamp } from './util'

async function getLatestEventBlockNumberFromDb() {
  const eventArray = await CreateTokenEvent.find({}).sort('-blockNumber').limit(1).exec()
  return eventArray === [] ? null : eventArray[0].blockNumber
}

export async function getTokenCreatedEvents() {
  logger.info('==== Start event import ====')
  const contract = new ethers.Contract(contractAddress, abi, provider)

  const filter = 'TokenCreated'
  const startBlock = await getLatestEventBlockNumberFromDb()
  const endBlock = 'latest'
  const events = await contract.queryFilter(filter, startBlock, endBlock)

  const cleanedEvents = []
  for (const event of events) {
    const { blockNumber, transactionHash }: { blockNumber: number; transactionHash: string } = event
    const existingEvent = await CreateTokenEvent.findOne({ transactionHash })
    if (existingEvent) {
      if (!(existingEvent.unixTimestamp === 1234567890)) {
        continue
      }
      const eventBlock = await Block.findOne({ blockNumber })
      const { unixTimestamp: eventBlockUnixTimestamp } = eventBlock
      const eventBlockDate = getDateFromUnixTimestamp(eventBlockUnixTimestamp)
      await CreateTokenEvent.findByIdAndUpdate(
        { _id: existingEvent._id },
        {
          unixTimestamp: eventBlock ? eventBlockUnixTimestamp : 1234567890,
          timestamp: eventBlock ? eventBlockDate : getDateFromUnixTimestamp(1234567890)
        }
      )
      continue
    }

    const eventBlock = await Block.findOne({ blockNumber })
    const { unixTimestamp: eventBlockUnixTimestamp } = eventBlock
    const eventBlockDate = getDateFromUnixTimestamp(eventBlockUnixTimestamp)

    cleanedEvents.push({
      blockNumber,
      unixTimestamp: eventBlock ? eventBlockUnixTimestamp : 1234567890,
      timestamp: eventBlock ? eventBlockDate : getDateFromUnixTimestamp(1234567890),
      transactionHash
    })
  }

  await CreateTokenEvent.insertMany(cleanedEvents)
  logger.info('==== Finished event import ====')
}
