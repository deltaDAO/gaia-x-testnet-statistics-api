import { QueryOptions } from 'mongoose'
import { TCreateTrustAnchor, TCreateTrustAnchorList, ITrustAnchorList } from '../../interfaces/trustAnchor.interface'
import TrustAnchorList from '../../models/trustAnchorList.model'
import { logger } from '../../utils/logger'

export default abstract class TrustAnchorListParser {
  trustAnchorList: ITrustAnchorList
  trustAnchorListObject: Object

  constructor(_trustAnchorList: ITrustAnchorList, _trustAnchorListObject?: Object) {
    this.trustAnchorList = _trustAnchorList
    if (_trustAnchorListObject) this.trustAnchorListObject = _trustAnchorListObject
  }

  /**
   * Decide whether a given TrustAnchorList should be re-fetched or not.
   * Could be called regularly on a schedule to enable automatic "re-fetching" of TrustAnchors.
   *
   * @returns {boolean} if the TrustAnchors from this list should be fetched
   */
  // TODO: implement updateCycles rather than hardcoded time difference
  shouldFetchNow(): boolean {
    if (!this.trustAnchorList.lastFetchDate) {
      logger.debug(`[eiDASParser:shouldFetchNow] Could not find a lastFetchDate for: ${this.trustAnchorList.uri}. Should fetch now.`)
      return true
    }

    const diffTime = Math.abs(Date.now() - this.trustAnchorList.lastFetchDate.getTime())
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    const shouldFetch = diffDays >= 14
    logger.debug(
      `[eiDASParser:shouldFetchNow] List was fetched ${diffDays} ago. ${shouldFetch ? 'Should fetch again now.' : 'Should not be fetched again.'}`
    )

    return shouldFetch
  }

  /**
   * Fetch all TrustAnchors from the TrustAnchorList of this parser.
   *
   * @returns {Promise<CreateTrustAnchorDto[]>} a promise resolving to the found TrustAnchors in the list
   */
  async fetchTrustAnchors(): Promise<TCreateTrustAnchor[]> {
    if (!this.shouldFetchNow()) return []

    return await this.getTrustAnchors()
  }

  /**
   * Parse the list of this TrustAnchorListParser for TrustAnchors.
   *
   * This function is used internally and in protected scope only. If you need to get the TrustAnchors from outside the class use {@link fetchTrustAnchors} instead.
   *
   * @returns {Promise<CreateTrustAnchorDto[]>} a promise resolving to the found TrustAnchors in the list
   */
  protected abstract getTrustAnchors(): Promise<TCreateTrustAnchor[]>

  /**
   * Create a new TrustAnchorList database entry.
   *
   * @param createTrustAnchorListDto the dto to create the list with
   * @returns {Promise<ITrustAnchorList>} a promise resolving to the created TrustAnchorList
   */
  static async createTrustAnchorList(createTrustAnchorListDto: TCreateTrustAnchorList): Promise<ITrustAnchorList> {
    try {
      const createTrustAnchorList = await TrustAnchorList.create(createTrustAnchorListDto)

      return createTrustAnchorList
    } catch (error) {
      logger.error(error)
    }
  }

  /**
   * Find and update a TrustAnchorList database entry. If the entry is not found a new one will be created.
   *
   * @param createTrustAnchorListDto the dto to create the list with
   * @returns {Promise<ITrustAnchorList>} a promise resolving to the updated or created TrustAnchorList
   */
  static async findAndUpdateOrCreateTrustAnchorList(createTrustAnchorListDto: TCreateTrustAnchorList): Promise<ITrustAnchorList> {
    const { uri } = createTrustAnchorListDto
    const options: QueryOptions = { upsert: true, setDefaultsOnInsert: true, new: true }
    const findTrustAnchorList = await TrustAnchorList.findOneAndUpdate({ uri }, createTrustAnchorListDto, options)

    return findTrustAnchorList
  }
}
