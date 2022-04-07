process.env['NODE_CONFIG_DIR'] = __dirname + '/configs'

import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors, { CorsOptions } from 'cors'
import config from 'config'
import express from 'express'
import helmet from 'helmet'
import hpp from 'hpp'
import morgan from 'morgan'
import { connect } from 'mongoose'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { dbConnection } from './databases'
import { Routes } from './interfaces/routes.interface'
import errorMiddleware from './middlewares/error.middleware'
import { logger, stream } from './utils/logger'
import { version, name, description } from '../package.json'
import { startFetchBlockchainData } from './utils/fetchBlockchainData'

class App {
  public app: express.Application
  public port: string | number
  public env: string

  constructor(routes: Routes[]) {
    this.app = express()
    this.port = process.env.PORT || 3000
    this.env = process.env.NODE_ENV || 'development'

    this.connectToDatabase()
    this.initializeMiddlewares()
    this.initializeRoutes(routes)
    this.initializeSwagger()
    this.initializeErrorHandling()

    //this.initializeTrustAnchors()
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`)
      logger.info(`======= ENV: ${this.env} =======`)
      logger.info(`🚀 App listening on the port ${this.port}`)
      logger.info(`=================================`)
    })
  }

  public getServer() {
    return this.app
  }

  private connectToDatabase() {
    if (this.env !== 'production') {
      //set('debug', true)
    }
    logger.info(`[Mongoose] trying to connect at ${dbConnection.url} with:`)
    connect(dbConnection.url, dbConnection.options)
      .then(mongoose => {
        logger.info(`[Mongoose] connected to mongodb at ${dbConnection.url}:`, mongoose.connection)
        logger.log('debug', `[Mongoose] connected to mongodb at ${dbConnection.url}:`)
        logger.log('debug', mongoose.connection)
      })
      .catch(err => {
        logger.error(`[Mongoose] connection error: ${err.message}`)
      })
  }

  private prepareCorsOptions(): CorsOptions {
    let originConfig: CorsOptions['origin'] = config.get('cors.origin')

    if (originConfig.constructor === Array) {
      originConfig = (originConfig as string[]).map(origin => new RegExp(origin))
    } else {
      originConfig = new RegExp(originConfig as string)
    }

    const options = {
      origin: originConfig,
      credentials: config.get('cors.credentials') as CorsOptions['credentials']
    }

    logger.info(`[CORS] prepared the following CORS options from config:`)
    logger.info(options)

    return options
  }

  private initializeMiddlewares() {
    this.app.use(morgan(config.get('log.format'), { stream }))
    this.app.use(cors(this.prepareCorsOptions()))
    this.app.use(hpp())
    this.app.use(helmet())
    this.app.use(compression())
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(cookieParser())
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router)
    })
  }

  private initializeSwagger() {
    const options: swaggerJSDoc.OAS3Options = {
      definition: {
        openapi: '3.0.3',
        info: {
          title: name,
          description: description,
          version: version,
          license: {
            name: 'Apache 2.0',
            url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
          }
        }
      },
      // TODO: decide on what style to use (docs in routes vs. dedicated .yml file)
      // apis: ['./routes/routes*.js']
      apis: ['swagger.yml']
    }

    const specs = swaggerJSDoc(options)

    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }))
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware)
  }
}
startFetchBlockchainData()

export default App
