const ethers = require('ethers')
const gaiaxUrl = 'https://rpc.gaiaxtestnet.oceanprotocol.com:443'
const provider = new ethers.providers.JsonRpcProvider(gaiaxUrl)
const { abi, contractAddress } = require('./dtfactory.json')
import CreateTokenEvent from '../models/createTokenEvent.model'

export async function getEvents() {
  const contract = new ethers.Contract(contractAddress, abi, provider)

  const filter = 'TokenCreated'
  const startBlock = 0
  const endBlock = 'latest'
  const events = await contract.queryFilter(filter, startBlock, endBlock)

  const cleanedEvents = []
  for (const event of events) {
    cleanedEvents.push({
      blockNumber: event.blockNumber,
      unixTimestamp: 1648149680,
      timestamp: 1648149680,
      transactionHash: event.transactionHash
    })
  }

  const result = await CreateTokenEvent.insertMany(cleanedEvents)
  console.log('Finished event import', result)
}
