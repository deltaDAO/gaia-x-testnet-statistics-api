const ethers = require('ethers')
import Block from '../models/block.model'

const providerURL = 'http://localhost:8545' //`https://rpc.gaiaxtestnet.oceanprotocol.com` // or use your local node 'http://localhost:8545'
const provider = new ethers.providers.JsonRpcProvider(providerURL)

function getBlock(blockNumber) {
  return provider.getBlock(blockNumber)
}

function getTransaction(txHash) {
  return provider.getTransaction(txHash)
}

export async function fetchBlocks() {
  console.log('==== Start Block import... ====')
  //const accountSet = new Set()
  const blockArray = []
  const blockNumberStart = 802681 // 802681 is the first event Block;  3175588 December-02-2021 09:30:00 AM +1 UTC
  const blockNumberEnd = 5026729 // 2022-03-24 22:26:00 +1 UTC

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
  console.log(' ==== Finished Block import ====')
}
