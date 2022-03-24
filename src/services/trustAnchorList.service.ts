import { definedTrustAnchorLists } from '../configs/trustFramwork.json'
import { TAL_PARSING_CLASSES, TCreateTrustAnchor, TCreateTrustAnchorList } from '../interfaces/trustAnchor.interface'
import { logger } from '../utils/logger'
import TrustAnchorListParser from '../utils/parsers/TrustAnchorListParser'
import TrustAnchorService from './trustAnchor.service'

export default class TrustAnchorListService {
  parentLists = definedTrustAnchorLists as TCreateTrustAnchorList[]

  /**
   * Fetch all trust anchors, starting from the {@link definedTrustAnchorLists} config
   *
   * @returns {Promise<number>} a promise resolving to the number of updated trust anchors
   */
  async fetchAllTrustAnchorLists() {
    let allTrustAnchors: TCreateTrustAnchor[] = []
    try {
      // For each trust anchor list in the config .json
      for (const list of this.parentLists) {
        // find or create the list in the database
        const findTtrustAnchorList = await TrustAnchorListParser.findAndUpdateOrCreateTrustAnchorList(list)

        // instantiate the correct parser for the list
        const parser = new TAL_PARSING_CLASSES[findTtrustAnchorList.parserClass](findTtrustAnchorList)

        // fetch the trust anchors from the list with the parser
        const trustAnchors = await parser.fetchTrustAnchors()

        // add them to the allTrustAnchors array
        allTrustAnchors = allTrustAnchors.concat(trustAnchors)
      }
    } catch (error) {
      logger.error(error)
    } finally {
      // finally update all found trust anchors
      const updated = await TrustAnchorService.updateTrustAnchors(allTrustAnchors)

      // and return the number of updated anchors
      return updated
    }
  }
}
