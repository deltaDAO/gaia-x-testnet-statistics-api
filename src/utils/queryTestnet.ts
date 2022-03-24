import { fetchBlocks } from './fetchBlocks'
import { getEvents } from './fetchCreateTokenEvents'

export async function queryTestnet() {
  await fetchBlocks()
  await getEvents()
}
