import { NextFunction, Request, Response } from 'express'
import { version, name, description } from '../../package.json'

class IndexController {
  public index = (req: Request, res: Response, next: NextFunction) => {
    try {
      const info = {
        software: name,
        description: description,
        version: version
      }
      res.json(info)
    } catch (error) {
      next(error)
    }
  }
}

export default IndexController
