const ethers = require('ethers')
const gaiaxUrl = 'https://rpc.gaiaxtestnet.oceanprotocol.com:443'
const provider = new ethers.providers.JsonRpcProvider(gaiaxUrl)
const { abi, contractAddress } = require('./dtfactory.json')
import CreateTokenEvent from '../models/createTokenEvent.model'
import Block from '../models/block.model'
import { logger } from './logger'
import { getDateFromUnixTimestamp } from './util'
import { CreateTokenEvent as CreateTokenEventI } from 'interfaces/createTokenEvent.interface'
import { Block as BlockI } from 'interfaces/block.interface'
import { PLACEHOLDER_TIMESTAMP } from './constants'

async function getLatestEventBlockNumberFromDb() {
  const eventArray = await CreateTokenEvent.find({}).sort('-blockNumber').limit(1).exec()
  return eventArray?.[0]?.blockNumber
}

async function findCreateTokenEvent(transactionHash: string): Promise<CreateTokenEventI> {
  return CreateTokenEvent.findOne({ transactionHash })
}

async function updateCreateTokenEventTimestamps(id: string, eventBlockUnixTimestamp: number) {
  const eventBlockDate = getDateFromUnixTimestamp(eventBlockUnixTimestamp)
  const update = {
    unixTimestamp: eventBlockUnixTimestamp,
    timestamp: eventBlockDate
  }
  return CreateTokenEvent.findByIdAndUpdate({ _id: id }, update)
}

async function saveCreateTokenEvents(events: CreateTokenEventI[]) {
  CreateTokenEvent.insertMany(events)
}

async function findBlock(blockNumber: number): Promise<BlockI> {
  return Block.findOne({ blockNumber })
}

export async function getTokenCreatedEvents() {
  try {
    logger.info('==== Start event import ====')
    const contract = new ethers.Contract(contractAddress, abi, provider)

    const filter = 'TokenCreated'
    const startBlock = (await getLatestEventBlockNumberFromDb()) ?? 0
    const endBlock = 'latest'

    const events = await contract.queryFilter(filter, startBlock, endBlock)
    const cleanedEvents: CreateTokenEventI[] = []

    for (const event of events) {
      const { blockNumber, transactionHash }: { blockNumber: number; transactionHash: string } = event
      const existingEvent = await findCreateTokenEvent(transactionHash)
      const eventBlock = await findBlock(blockNumber)
      if (!eventBlock && !existingEvent) {
        cleanedEvents.push({
          blockNumber,
          unixTimestamp: PLACEHOLDER_TIMESTAMP,
          timestamp: getDateFromUnixTimestamp(PLACEHOLDER_TIMESTAMP),
          transactionHash
        })
        logger.info(`Added TokenCreated event: ${transactionHash} Block: ${blockNumber}`)
        continue
      }
      if (!eventBlock) {
        continue
      }
      const { unixTimestamp: eventBlockUnixTimestamp } = eventBlock
      const eventBlockDate = getDateFromUnixTimestamp(eventBlockUnixTimestamp)

      if (existingEvent) {
        if (!(existingEvent.unixTimestamp === PLACEHOLDER_TIMESTAMP)) {
          continue
        }
        await updateCreateTokenEventTimestamps(existingEvent._id, eventBlockUnixTimestamp)
        logger.info(`Updated timestamp TokenCreated event: ${transactionHash} Block: ${blockNumber}`)
        continue
      }

      cleanedEvents.push({
        blockNumber,
        unixTimestamp: eventBlockUnixTimestamp,
        timestamp: eventBlockDate,
        transactionHash
      })
      logger.info(`Added TokenCreated event: ${transactionHash} Block: ${blockNumber}`)
    }

    await saveCreateTokenEvents(cleanedEvents)
  } catch (error) {
    logger.error(error)
  }
  logger.info('==== Finished event import ====')
}
