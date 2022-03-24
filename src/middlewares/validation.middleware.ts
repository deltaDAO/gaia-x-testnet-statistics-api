import { Schema } from 'joi'
import { RequestHandler } from 'express'
import { HttpException } from '../exceptions/HttpException'

const validationMiddleware = (schema: Schema, reqValue: string | 'body' | 'query' | 'params' = 'body'): RequestHandler => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[reqValue])

    if (error) {
      const message = error.details.map(d => d.message).join(', ')
      next(new HttpException(400, message))
    } else {
      req[reqValue] = value
      next()
    }
  }
}

export default validationMiddleware
