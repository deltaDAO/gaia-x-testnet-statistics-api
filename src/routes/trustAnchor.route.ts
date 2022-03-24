import { Router } from 'express'
import validationMiddleware from '../middlewares/validation.middleware'
import TrustAnchorController from '../controllers/trustAnchor.controller'
import { Routes } from '../interfaces/routes.interface'
import { trustAnchorRequestSchema } from '../dtos/trustAnchor.dto'

class TrustAnchorRoute implements Routes {
  public path = '/api/trustAnchor'
  public router = Router()
  public trustAnchorController = new TrustAnchorController()

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, validationMiddleware(trustAnchorRequestSchema, 'body'), this.trustAnchorController.getTrustAnchor)
  }
}

export default TrustAnchorRoute
