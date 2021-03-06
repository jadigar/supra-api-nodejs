require('dotenv').config()
require('./globals')()

const { Model } = require('objection')
const Knex = require('knex')

const { Server, assert } = require('supra-core')
const controllers = require('./controllers')
const config = require('./config')
const middlewares = require('./middlewares')
const errorMiddleware = require('./middlewares/errorMiddleware')
const logger = require('./util/logger')

new Server({
  port: Number(config.app.port),
  host: config.app.host,
  controllers,
  middlewares,
  errorMiddleware,
  logger
}).then(serverParams => {
  __logger.trace('Server initialized...', serverParams)
  __logger.info('--- Configs ---')
  __logger.info('App config:', config.app)
  __logger.info('Refresh token:', config.token.refresh)
  __logger.info('Access token:', config.token.access.toString())
  __logger.info('Reset password token:', config.token.resetPassword.toString())
  __logger.info('Email confirm token:', config.token.emailConfirm.toString())
  __logger.info('Tokens iss:', config.token.jwtIss)
}).catch(error => __logger.error('Server fails to initialize...', error))
  .then(() => Model.knex(Knex(config.knex)))
  .then(() => testDbConnection(Knex(config.knex)))
  .then(() => {
    __logger.info('--- Database ---')
    __logger.info('Database initialized...', config.knex)
  }).catch(error => {
    __logger.error('Database fails to initialize...', error)
    process.exit(1)
  })

async function testDbConnection (knexInstance) {
  assert.func(knexInstance, { required: true })
  assert.func(knexInstance.raw, { required: true })

  try {
    await knexInstance.raw('select 1+1 as result')
  } catch (e) {
    throw e
  } finally {
    knexInstance.destroy()
  }
}
