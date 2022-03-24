const ethers = require('ethers')
const gaiaxUrl = 'https://rpc.gaiaxtestnet.oceanprotocol.com:443'
const provider = new ethers.providers.JsonRpcProvider(gaiaxUrl)
const { abi, contractAddress } = require('./dtfactory.json')
import CreateTokenEvent from '../models/createTokenEvent.model'
import Block from '../models/block.model'

export async function getEvents() {
  console.log('==== Start event import... ====')
  const contract = new ethers.Contract(contractAddress, abi, provider)

  const filter = 'TokenCreated'
  const startBlock = 0
  const endBlock = 'latest'
  const events = await contract.queryFilter(filter, startBlock, endBlock)

  const cleanedEvents = []
  for (const event of events) {
    const eventBlock = await Block.findOne({ blockNumber: event.blockNumber })
    cleanedEvents.push({
      blockNumber: event.blockNumber,
      unixTimestamp: eventBlock ? eventBlock.unixTimestamp : 1234567890,
      timestamp: eventBlock ? eventBlock.unixTimestamp : 1234567890,
      transactionHash: event.transactionHash
    })
  }

  const result = await CreateTokenEvent.insertMany(cleanedEvents)
  console.log('==== Finished event import ====')
}
