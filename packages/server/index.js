/**
 * @fileoverview AWS Lambda entry point for the Fastify application.
 */

import env from 'env'
import cors from '@fastify/cors'
import awsLambdaFastify from '@fastify/aws-lambda'
import build from './src/app.js'

env.init()

const app = await build()

app.register(cors, {
  origin: ['https://mytoolbox.app'],
  methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTION'],
  credentials: true,
})

const proxy = awsLambdaFastify(app, {
  callbackWaitsForEmptyEventLoop: false, // lambda should not wait for open db connections
})

export const handler = proxy

// or
// exports.handler = (event, context, callback) => proxy(event, context, callback)
// or
// exports.handler = (event, context) => proxy(event, context)
// or
// exports.handler = async (event, context) => proxy(event, context)
