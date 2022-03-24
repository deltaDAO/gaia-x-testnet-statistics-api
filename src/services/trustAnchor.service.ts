import { ValidationResult } from 'joi'
import { TTrustAnchorRequest } from '../dtos/trustAnchor.dto'
import { HttpException } from '../exceptions/HttpException'
import { ITrustAnchor, ITrustAnchorResponse, TCreateTrustAnchor, TrustStates } from '../interfaces/trustAnchor.interface'
import TrustAnchor from '../models/trustAnchor.model'
import TrustAnchorList from '../models/trustAnchorList.model'
import { logger } from '../utils/logger'
import { isEmpty } from '../utils/util'

class TrustAnchorService {
  public trustAnchor = TrustAnchor
  public trustAnchorList = TrustAnchorList

  public async findTrustAnchor(trustAnchorData: ValidationResult<TTrustAnchorRequest>['value']): Promise<ITrustAnchorResponse> {
    if (isEmpty(trustAnchorData)) throw new HttpException(400, 'Request body invalid.')

    const findTrustAnchor: ITrustAnchor = await this.trustAnchor.findOne({ publicKey: trustAnchorData.publicKey })

    if (!findTrustAnchor) throw new HttpException(409, 'Trust Anchor not found.')

    const response = await this.prepareTrustAnchorResponse(findTrustAnchor)

    return response
  }

  private async prepareTrustAnchorResponse(trustAnchor: ITrustAnchor): Promise<ITrustAnchorResponse> {
    const trustAnchorResponse: ITrustAnchorResponse = {
      trustState: TrustStates.Trusted,
      trustedForAttributes: new RegExp('.*', 'gm').toString(),
      trustedAt: trustAnchor.lastTimeOfTrust?.getTime()
    }

    return trustAnchorResponse
  }

  /**
   * Update TrustAnchors in the DB from a given {@link TCreateTrustAnchor} array
   * @param {TCreateTrustAnchor[]} trustAnchors the trust anchors to update
   * @param {Object} options an options object
   * @param {boolean} options.upsert if new trust anchors should be inserted
   * @returns {Promise<number>} a promise resolving to the number of db entries that were updated
   */
  static async updateTrustAnchors(trustAnchors: TCreateTrustAnchor[], { upsert } = { upsert: true }) {
    const mongoPromises = []
    for (const ta of trustAnchors) {
      // find trustAnchors by publicKey & _list id
      const { publicKey, _list } = ta
      const updatePromise = TrustAnchor.findOneAndUpdate({ publicKey, _list }, ta, { upsert: upsert }).catch(e => logger.error(e))
      mongoPromises.push(updatePromise)
    }

    await Promise.all(mongoPromises)

    return mongoPromises.length
  }
}

export default TrustAnchorService
