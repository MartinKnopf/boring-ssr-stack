/**
 * @fileoverview Server entry point for running the Fastify application locally.
 */

import env from 'env'
import build from './app.js'
import cors from '@fastify/cors'

env.init()
const port = Number(env.get('PORT'))

const app = await build()

app.register(cors, {
  origin: [`http://localhost:${port}`],
  methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTION'],
  credentials: true,
})

app.listen({ port }, (err) => {
  if (err) {
    console.error(err)
  }
  console.log(`server listening on ${port}`)
})
