import { XMLParser } from 'fast-xml-parser'
import fetch from 'node-fetch'
import { TCreateTrustAnchor, TCreateTrustAnchorList, ITrustAnchorList } from '../../interfaces/trustAnchor.interface'
import TrustAnchorListParser from './TrustAnchorListParser'
import { IDigitalId, IName, ITrustedList, ITSPService, ITSPServiceWithSPName } from '../../interfaces/eiDAS.interface'
import TrustAnchorList from '../../models/trustAnchorList.model'
import { logger } from '../logger'
import { getValueAsArray } from '../util'

/**
 * https://ec.europa.eu/tools/lotl/eu-lotl.xml
 * The eiDAS LOTL is a collection of trusted lists (TL)
 * The TLs are issued by the different member states
 * The locations (uris) of the different lists are located
 * in a respective "OtherTSLPointer" tag, which in turn are
 * collected inside the "PointersToOtherTSL" tag
 */
export default class EiDASTrustedListParser extends TrustAnchorListParser {
  trustAnchorListObject: ITrustedList

  static xmlParser = new XMLParser()

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

  protected async getTrustAnchors(): Promise<TCreateTrustAnchor[]> {
    // Initialize the array that should hold the returned trustAnchors
    let createTrustAnchorDtos: TCreateTrustAnchor[] = []
    if (!this.shouldFetchNow()) return createTrustAnchorDtos
    try {
      logger.debug(`[eiDASParser:getTrustAnchors] Getting TrustAnchors for ${this.trustAnchorList.uri}`)
      // First get the xml string at the lists uri parsed into a js object
      if (!this.trustAnchorListObject) this.trustAnchorListObject = await EiDASTrustedListParser.getTrustedListObject(this.trustAnchorList.uri)
      const listObject = this.trustAnchorListObject

      // Then we need to check if the list has any trust anchors itself
      const tspServices = await EiDASTrustedListParser.getTrustServiceProviderServicesFromTrustedList(listObject)
      // and add them to the returned array
      const trustAnchors = this.getCreateTrustAnchorDtosFromTSPServices(tspServices)
      createTrustAnchorDtos = createTrustAnchorDtos.concat(trustAnchors)
      logger.debug(`[eiDASParser:getTrustAnchors] Found ${trustAnchors.length} TrustAnchors for ${this.trustAnchorList.uri}`)

      // once we have the trust anchors, we need to update the lastFetchDate for the DB entry
      // to prevent fetching the list again if it is found in any OtherTSLPointer
      await TrustAnchorList.findByIdAndUpdate(this.trustAnchorList._id, { lastFetchDate: new Date() })

      // We also want to check for any pointers to other trusted lists
      const { PointersToOtherTSL } = listObject.TrustServiceStatusList.SchemeInformation
      const otherTSLPointers = getValueAsArray(PointersToOtherTSL.OtherTSLPointer)
      logger.debug(`[eiDASParser:getTrustAnchors] Found ${otherTSLPointers.length} OtherTSLPointers in ${this.trustAnchorList.uri}`)

      // and if we find any
      for (const tslPointer of otherTSLPointers) {
        try {
          // find or create the respective ITrustAnchorList,
          const tslPointerListObject = await EiDASTrustedListParser.getTrustedListObject(tslPointer.TSLLocation)
          const createTalDto = await EiDASTrustedListParser.getCreateTrustAnchorListDto(tslPointer.TSLLocation, tslPointerListObject)
          const findTrustAnchorList = await TrustAnchorListParser.findAndUpdateOrCreateTrustAnchorList(createTalDto)

          // get a parser for that list,
          const tslPointerParser = new EiDASTrustedListParser(findTrustAnchorList, tslPointerListObject)
          // parse the list for TrustAnchors
          const tslPointerTrustAnchors = await tslPointerParser.getTrustAnchors()

          // and add those TrustAnchors to the returned array
          createTrustAnchorDtos = createTrustAnchorDtos.concat(tslPointerTrustAnchors)
        } catch (error) {
          logger.error(error)
          continue
        }
      }
    } catch (error) {
      logger.error(error)
    } finally {
      // finally return the createTrustAnchorsDtos
      return createTrustAnchorDtos
    }
  }

  private getCreateTrustAnchorDtosFromTSPServices(services: ITSPServiceWithSPName[]): TCreateTrustAnchor[] {
    const createTrustAnchorDtos: TCreateTrustAnchor[] = []
    for (const service of services) {
      const name = EiDASTrustedListParser.getTrustAnchorName(service.TSPName, service.ServiceInformation.ServiceName)
      const { DigitalId } = service.ServiceInformation.ServiceDigitalIdentity
      const publicKey = EiDASTrustedListParser.findX509CredentialDigitalId(getValueAsArray(DigitalId)).X509Certificate

      const _list = this.trustAnchorList._id

      createTrustAnchorDtos.push({
        name,
        publicKey,
        _list
      })
    }
    return createTrustAnchorDtos
  }

  /******************************************/
  /********** STATIC CLASS HELPERS **********/
  /******************************************/

  static filterForX509CertificateServices(services: ITSPService[]): ITSPService[] {
    const filteredServices = services.filter(service => {
      const { DigitalId } = service.ServiceInformation.ServiceDigitalIdentity
      return EiDASTrustedListParser.findX509CredentialDigitalId(getValueAsArray(DigitalId))
    })

    return filteredServices
  }

  static async findAndUpdateOrCreateTal(createTalDto: TCreateTrustAnchorList): Promise<ITrustAnchorList> {
    const { uri } = createTalDto
    const findTrustAnchorList = await TrustAnchorList.findOneAndUpdate({ uri }, createTalDto, { upsert: true, setDefaultsOnInsert: true, new: true })

    return findTrustAnchorList
  }

  static findX509CredentialDigitalId(ids: IDigitalId[]): IDigitalId {
    return ids.find(id => id.X509Certificate)
  }

  static async getCreateTrustAnchorListDto(uri: string, listObject?: ITrustedList): Promise<TCreateTrustAnchorList> {
    if (!listObject) listObject = await EiDASTrustedListParser.getTrustedListObject(uri)
    return {
      uri,
      name: EiDASTrustedListParser.getNameAsString(listObject.TrustServiceStatusList.SchemeInformation.SchemeName),
      parserClass: 'eiDASParser'
    }
  }

  static getNameAsString(name: IName): string {
    return Array.isArray(name.Name) ? name.Name[0] : name.Name
  }

  static getTrustAnchorName(TSPName: IName, ServiceName: IName): string {
    const tspName = EiDASTrustedListParser.getNameAsString(TSPName)
    const serviceName = EiDASTrustedListParser.getNameAsString(ServiceName)
    return `${tspName} - ${serviceName}`
  }

  static async getTrustedListObject(uri: string): Promise<ITrustedList> {
    const response = await fetch(uri)

    const xmlString = await response.text()
    const tlData: ITrustedList = this.xmlParser.parse(xmlString)

    return tlData
  }

  static getTrustServiceProviderServicesFromTrustedList(trustedListObject: ITrustedList): ITSPServiceWithSPName[] {
    let x509TrustServiceProviderServices: ITSPServiceWithSPName[] = []

    try {
      const { TrustServiceProviderList } = trustedListObject.TrustServiceStatusList

      // Make sure we have an iterable array for listTsps
      const { TrustServiceProvider } = TrustServiceProviderList
      const listTsps = getValueAsArray(TrustServiceProvider)

      for (const tsp of listTsps) {
        // filter for services with X509 certificate attribute
        const { TSPService } = tsp.TSPServices
        const filteredServices = EiDASTrustedListParser.filterForX509CertificateServices(getValueAsArray(TSPService))

        const filteredServicesWithTSPNames = filteredServices.map(service => ({
          ...service,
          TSPName: tsp.TSPInformation.TSPName
        }))
        x509TrustServiceProviderServices = x509TrustServiceProviderServices.concat(filteredServicesWithTSPNames)
      }
    } catch (error) {
      logger.error(error)
    } finally {
      return x509TrustServiceProviderServices
    }
  }
}
