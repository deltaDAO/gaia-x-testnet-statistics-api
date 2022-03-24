import EiDASTrustedListParser from '../utils/parsers/EiDASTrustedListParser'
import MozillaCAListParser from '../utils/parsers/MozillaCAListParser'

export const TAL_PARSING_CLASSES = {
  eiDASParser: EiDASTrustedListParser,
  mozillaParser: MozillaCAListParser
}

// states will be extended in the future
export enum TrustStates {
  Trusted = 'trusted',
  Untrusted = 'untrusted'
}

type OmitMongoProps<T> = Omit<T, '_id' | 'createdAt' | 'updatedAt'>

export interface ITrustAnchor {
  _id: string
  name: string
  _list: string
  publicKey: string
  createdAt: Date
  updatedAt: Date
  uri?: string
  trustState?: TrustStates
  lastTimeOfTrust?: Date
}
export type TCreateTrustAnchor = OmitMongoProps<ITrustAnchor>

export interface ITrustAnchorList {
  _id: string
  name: string
  uri: string
  parserClass: keyof typeof TAL_PARSING_CLASSES
  createdAt: Date
  updatedAt: Date
  updateCycle?: number
  lastFetchDate?: Date
}
export type TCreateTrustAnchorList = OmitMongoProps<ITrustAnchorList>

export interface ITrustAnchorResponse {
  trustState: TrustStates
  trustedForAttributes?: string
  trustedAt?: number
}
