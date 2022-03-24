export interface IName {
  Name: string | string[]
}

export interface IOtherInformation {
  'ns3:MimeType'?: string
  SchemeOperatorName?: IName
}

export interface IOtherTSLPointer {
  ServiceDigitalIdentities: any[]
  TSLLocation: string
  AdditionalInformation: {
    OtherInformation: IOtherInformation | IOtherInformation[]
  }
}

export interface ISchemeInformation {
  TSLVersionIdentifier: number
  TSLSequenceNumber: number
  SchemeName: IName
  SchemeOperatorName: IName
  PointersToOtherTSL: {
    OtherTSLPointer: IOtherTSLPointer | IOtherTSLPointer[]
  }
}

export interface ITSPInformation {
  TSPName: IName
}

export interface IDigitalId {
  X509Certificate?: string
}

export interface ITSPService {
  ServiceInformation: {
    ServiceTypeIdentifier: string
    ServiceName: IName
    ServiceStatus: string
    StatusStartingTime: Date
    ServiceDigitalIdentity: {
      DigitalId: IDigitalId | IDigitalId[]
    }
  }
}
export interface ITSPServiceWithSPName extends ITSPService {
  TSPName: ITSPInformation['TSPName']
}

export interface ITrustServiceProvider {
  TSPInformation: ITSPInformation
  TSPServices: {
    TSPService: ITSPService | ITSPService[]
  }
}

//TODO: add ds:Signature typings
export interface ITrustedList {
  TrustServiceStatusList: {
    SchemeInformation: ISchemeInformation
    'ds:Signature': any
    TrustServiceProviderList?: {
      TrustServiceProvider: ITrustServiceProvider | ITrustServiceProvider[]
    }
  }
}
