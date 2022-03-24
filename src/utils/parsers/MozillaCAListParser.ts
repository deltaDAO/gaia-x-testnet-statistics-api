import fetch from 'node-fetch'
import { parse } from 'csv-parse/sync'
import { IMozillaCAList, IMozillaCARecord, IMozillaCARecordUnfiltered, TMozillaCARecordColumnModMap } from '../../interfaces/mozilla.interface'
import TrustAnchorListParser from './TrustAnchorListParser'
import { logger } from '../logger'
import TrustAnchorList from '../../models/trustAnchorList.model'
import { TCreateTrustAnchor } from '../../interfaces/trustAnchor.interface'

enum MozillaCAListColumns {
  CommonName = 'CommonNameorCertificateName',
  PEMInfo = 'PEMInfo',
  ValidFrom = 'ValidFrom[GMT]',
  ValidTo = 'ValidTo[GMT]'
}

/**
 * https://wiki.mozilla.org/CA/Included_Certificates
 * The Mozilla CA Certificate Program's list of included root certificates
 * is stored in a file called certdata.txt in the Mozilla source code management system.
 * We are utilizing the IncludedCACertificateWithPEMReport.csv which includes
 * raw PEM data about the certificates of CAs int the "PEM Info" field.
 */
export default class MozillaCAListParser extends TrustAnchorListParser {
  trustAnchorListObject: IMozillaCAList

  // Enable typings & easy iteration in class
  private static FILTER_FOR_COLUMNS: (keyof IMozillaCARecord)[] = Object.values(MozillaCAListColumns)

  // Configure modifications of columns of a given record
  private static COLUMN_MOD_MAP: TMozillaCARecordColumnModMap = {
    // PEMInfo holds the X509 certificate key
    [MozillaCAListColumns.PEMInfo]: MozillaCAListParser.stripPEMInfo
  }

  protected async getTrustAnchors(): Promise<TCreateTrustAnchor[]> {
    // Initialize the array that should hold the returned trustAnchors
    const createTrustAnchorDtos: TCreateTrustAnchor[] = []
    if (!this.shouldFetchNow()) return createTrustAnchorDtos

    try {
      // First get the csv file at the lists uri parsed into a js object
      if (!this.trustAnchorListObject) this.trustAnchorListObject = await MozillaCAListParser.getMozillaCAListObject(this.trustAnchorList.uri)
      const listObject = this.trustAnchorListObject

      // then map over all the records in the csv list,
      listObject.records.forEach(record =>
        // transforming each record in the correct TrustAnchor format
        // and add the TrustAnchor to the returned array
        createTrustAnchorDtos.push({
          name: record.CommonNameorCertificateName,
          publicKey: record.PEMInfo,
          _list: this.trustAnchorList._id
        })
      )
    } catch (error) {
      logger.error(error)
    } finally {
      // finally update the lastFetchDate of the list
      await TrustAnchorList.findByIdAndUpdate(this.trustAnchorList._id, { lastFetchDate: new Date() })
      // and return the TrustAnchors
      return createTrustAnchorDtos
    }
  }

  static async getMozillaCAListObject(uri: string): Promise<IMozillaCAList> {
    const response = await fetch(uri)

    const csvString = await response.text()
    const listObject: IMozillaCAList = {
      records: parse(csvString, {
        columns: MozillaCAListParser.transformCsvHeader,
        on_record: MozillaCAListParser.filterRecordAndCleanupColumns
      })
    }

    return listObject
  }

  /**
   * Filters a given record to only include properties as defined in {@link MozillaCAListParser.FILTER_FOR_COLUMNS}.
   * @param record an unfiltered record
   * @returns {IMozillaCARecord} the filtered record
   */
  static filterRecord(record: IMozillaCARecordUnfiltered): IMozillaCARecord {
    return Object.fromEntries(
      MozillaCAListParser.FILTER_FOR_COLUMNS.map(column => {
        return [column, record[column]]
      })
    ) as unknown as IMozillaCARecord
  }

  /**
   * Function that handles any cleanup and modifications to prepare the columns of a given record for DB storage
   * @param {IMozillaCARecord} record the record to be modified
   * @returns {IMozillaCARecord} the modified record
   */
  static cleanupRecordColumns(record: IMozillaCARecord): IMozillaCARecord {
    // Use the static modification map to modify column values of the record
    Object.keys(record).forEach(column => {
      // COLUMN_MOD_MAP maps funtions modifying a given string to the record column keys
      // Use the mod map to adjust a value, or use the given value as fallback
      const modFn: (v: string) => string = MozillaCAListParser.COLUMN_MOD_MAP[column]
      record[column] = modFn ? modFn(record[column]) : record[column]
    })

    return record
  }

  /**
   * Filter a given record (see {@link filterRecord}) and then cleanup its columns (see {@link cleanupRecordColumns})
   * @param {IMozillaCARecordUnfiltered} record to be filtered and cleaned
   * @returns {IMozillaCARecord} filtered and cleaned record
   */
  static filterRecordAndCleanupColumns(record: IMozillaCARecordUnfiltered): IMozillaCARecord {
    const filtered = MozillaCAListParser.filterRecord(record)
    const cleaned = MozillaCAListParser.cleanupRecordColumns(filtered)

    return cleaned
  }

  /**
   * Removes /-----(BEGIN|END) CERTIFICATE-----/ and any \n newlines from a given string to unify entries in the DB
   * @param PEMInfo the string (public key) to strip
   * @returns {IMozillaCARecord} the stripped publicKey
   */
  static stripPEMInfo(PEMInfo: string): string {
    return PEMInfo.replace(/([']*-----(BEGIN|END) CERTIFICATE-----[']*|\n)/gm, '')
  }

  static transformCsvHeader(header: string[]): string[] {
    return header.map(col => col.replace(/ /g, ''))
  }
}
