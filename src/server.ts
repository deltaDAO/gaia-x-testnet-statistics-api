process.env['NODE_CONFIG_DIR'] = __dirname + '/configs'

import 'dotenv/config'
import App from './app'
import validateEnv from './utils/validateEnv'

/* Routes */
// import IndexRoute from './routes/index.route'
// import TrustAnchorRoute from './routes/trustAnchor.route'

const routes = [] // [new IndexRoute(), new TrustAnchorRoute()]

validateEnv()

const app = new App(routes)

app.listen()
