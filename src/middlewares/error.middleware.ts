import { NextFunction, Request, Response } from 'express'
import { HttpException } from '../exceptions/HttpException'
import { logger } from '../utils/logger'

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  try {
    const defaultErrorMessage = 'Something went wrong'
    const status: number = error.status || 500
    const message: string = status >= 500 ? defaultErrorMessage : error.message || defaultErrorMessage

    logger.error(`[${req.method}] ${req.path} >> StatusCode: ${status}, Message: ${error.message}`)
    res.status(status).json({ message })
  } catch (error) {
    next(error)
  }
}

export default errorMiddleware
