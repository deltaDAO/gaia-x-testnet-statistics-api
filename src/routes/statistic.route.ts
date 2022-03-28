import StatisticController from '../controllers/statistic.controller'
import { Router } from 'express'
import { Routes } from '../interfaces/routes.interface'

class StatisticRoute implements Routes {
  public path = '/api/statistics'
  public router = Router()
  public statisticController = new StatisticController()

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.statisticController.getStatistic)
  }
}

export default StatisticRoute
