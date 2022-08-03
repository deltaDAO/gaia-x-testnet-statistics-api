import config from 'config'
import { dbConfig } from '../interfaces/db.interface'

const { host, port, database, username, password }: dbConfig = config.get('dbConfig')

export const dbConnection = {
  url: `mongodb://${process.env.DB_USERNAME || username}:${process.env.DB_PASSWORD || password}@${process.env.MONGO_HOST || host}:${
    process.env.MONGO_PORT || port
  }/${process.env.MONGO_DATABASE || database}`,
  options: { authSource: 'admin' }
}
