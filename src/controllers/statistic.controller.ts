import { NextFunction, Request, Response } from 'express'
import StatisticService from '../services/statistic.service'

class StatisticController {
  statisticService = new StatisticService()

  public getStatistic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const statisticResponse = await this.statisticService.findStatistic()
      res.status(200).json(statisticResponse)
    } catch (error) {
      next(error)
    }
  }
}

export default StatisticController
