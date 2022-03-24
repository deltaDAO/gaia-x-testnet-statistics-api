import { NextFunction, Request, Response } from 'express'
import TrustAnchorService from '../services/trustAnchor.service'

class TrustAnchorController {
  trustAnchorService = new TrustAnchorService()

  public getTrustAnchor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trustAnchorResponse = await this.trustAnchorService.findTrustAnchor(req.body)
      res.status(200).json(trustAnchorResponse)
    } catch (error) {
      next(error)
    }
  }
}

export default TrustAnchorController
