import config from 'config'
import { dbConfig } from '../interfaces/db.interface'

const { host, port, database }: dbConfig = config.get('dbConfig')

export const dbConnection = {
  url: `mongodb://${process.env.MONGO_HOST || host}:${process.env.MONGO_PORT || port}/${process.env.MONGO_DATABASE || database}`,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }
}
