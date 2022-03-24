import Joi from 'joi'

export type TTrustAnchorRequest = {
  publicKey: string
}

const trustAnchorRequestRules = {
  publicKey: Joi.string().empty().required()
}

export const trustAnchorRequestSchema = Joi.object<TTrustAnchorRequest>(trustAnchorRequestRules)
