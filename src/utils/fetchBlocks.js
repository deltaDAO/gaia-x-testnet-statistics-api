const ethers = require('ethers')
import Block from '../models/block.model'

const providerURL = `https://rpc.gaiaxtestnet.oceanprotocol.com` // or use your local node 'http://localhost:8545'
const provider = new ethers.providers.JsonRpcProvider(providerURL)

function getBlock(blockNumber) {
  return provider.getBlock(blockNumber)
}

function getTransaction(txHash) {
  return provider.getTransaction(txHash)
}

export async function fetchBlocks() {
  //const accountSet = new Set()
  const blockArray = []
  const blockNumberStart = 3175588 // December-02-2021 09:30:00 AM +1 UTC
  const blockNumberEnd = 3175610 // 3184397 // December-02-2021 09:44:05 PM +1 UTC

  for (let currentBlockNumber = blockNumberStart; currentBlockNumber < blockNumberEnd; currentBlockNumber++) {
    const newBlock = await getBlock(currentBlockNumber)
    blockArray.push({
      blockNumber: newBlock.number,
      unixTimestamp: newBlock.timestamp,
      timestamp: newBlock.timestamp,
      transactionHashes: newBlock.transactions
    })

    // for (let index = 0; index < transactions.length; index++) {
    //   let txHash = transactions[index]
    //   let { from, to } = await getTransaction(txHash)
    //   console.log(`${currentBlockNumber}/${blockNumberEnd}: ${from} ${to}`)
    //   accountSet.add(from)
    //   accountSet.add(to)
    // }
  }
  const result = await Block.insertMany(blockArray)
  console.log('Finished Block import')
}
