import fp from 'fastify-plugin'
import IndexRouter from './index.router.js'

export default fp(async (app) => {
  app.register(IndexRouter)
})
