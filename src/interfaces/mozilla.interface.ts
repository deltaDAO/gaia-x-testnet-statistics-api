export interface IMozillaCARecord {
  CommonNameorCertificateName: string
  PEMInfo: string
  'ValidFrom[GMT]': string
  'ValidTo[GMT]': string
}

// Used to enable modification of the value of any record colum
export type TMozillaCARecordColumnModMap = {
  [column in keyof IMozillaCARecord]?: (v: string) => string
}

export interface IMozillaCARecordUnfiltered extends IMozillaCARecord {
  [key: string]: string
}

export interface IMozillaCAList {
  records: IMozillaCARecord[]
}
