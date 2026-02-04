/**
 * @fileoverview Fastify application setup and configuration.
 */

import fs from 'node:fs'
import path from 'node:path'
import fastify from 'fastify'
import fastifyFormbody from '@fastify/formbody'
import fastifyView from '@fastify/view'
import fastifyStatic from '@fastify/static'
import Handlebars from 'handlebars'
import { getFastifyLoggerConfig } from 'logger'

import indexPlugin from './frontend/pages/index/index.plugin.js'

/**
 * @typedef {function(string): Promise<void>} RegisterHandlebarsPartial
 * @typedef {import('fastify').FastifyRequest} FastifyRequest
 * @typedef {import('fastify').FastifyReply} FastifyReply
 * @typedef {import('fastify').FastifyError & {status: number}} AppError
 */

export default async function () {
  const app = fastify({
    logger: getFastifyLoggerConfig(),
    bodyLimit: 5 * 1024 * 1024, // 5MB
  })

  app.log.info('Initializing app')

  // await this.fastify.register(fastifyCors, baseCorsConfig)
  await app.register(fastifyFormbody)

  // Configure Handlebars view engine
  await app.register(fastifyView, {
    engine: { handlebars: Handlebars },
    root: path.resolve(import.meta.dirname),
  })

  // Utility to register a handlebars partial from a file
  app.decorate(
    'registerHbsPartial',
    /** @type {RegisterHandlebarsPartial} */ (
      (file) => {
        const partialName = path.basename(file)
        const partialContent = fs.readFileSync(file, 'utf-8')
        Handlebars.registerPartial(partialName, partialContent)
        app.log.info(`Registered partial: ${partialName}`)
      }
    ),
  )

  // Serve static files from the "public" directory
  await app.register(fastifyStatic, {
    root: path.resolve(import.meta.dirname, 'frontend', 'public'),
    prefix: '/public/', // optional: default '/'
    constraints: {}, // optional: default {}
  })

  // Auto-register all shared component.html files as partials
  const viewsDir = path.join(import.meta.dirname, 'frontend', 'components')
  if (fs.existsSync(viewsDir)) {
    /** @type {function(string): void} */
    const scanForComponents = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      entries.forEach((entry) => {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          scanForComponents(fullPath)
        } else if (entry.name.endsWith('.html')) {
          const partialContent = fs.readFileSync(fullPath, 'utf-8')
          const partialName = path
            .relative(import.meta.dirname, fullPath)
            .split(path.sep)
            .join('/')
          app.log.info(`Registering partial: ${partialName}`)
          Handlebars.registerPartial(partialName, partialContent)
        }
      })
    }
    scanForComponents(viewsDir)
  }

  // global route error handler
  app.setErrorHandler(
    /** @type {function(AppError, FastifyRequest, FastifyReply): Promise<void>} */ (
      async function (error, request, reply) {
        if (error.status) {
          if (error.status === 500) {
            app.log.error(`Internal server error (request id ${request.id}):`)
            app.log.error(/** @type {any} */ (error))
          }

          if (error.code) {
            reply.code(error.status).send({ code: error.code, message: error.message })
          } else {
            reply.code(error.status).send({ message: error.message })
          }
        } else if (error.toString().includes('FST_ERR_CTP_INVALID_MEDIA_TYPE')) {
          // This check works around a quirky behavior in Fastify where it sends a 500 error when the request has an unsupported content type.
          reply.code(400).send({
            message: "Body content-type must be 'application/json'",
          })
        } else if (error.toString().includes('FST_ERR_CTP_EMPTY_JSON_BODY')) {
          // This check works around a quirky behavior in Fastify where it sends a 500 error when the request body is missing
          // while the content-type header is present. This check is to send a 400 error instead.
          // I already tried to implement this in a preParsing hook, but Fastify catches the error before it reaches the hook.
          reply.code(400).send({
            message: "Body cannot be empty when content-type is set to 'application/json'",
          })
        } else {
          app.log.error(`Unspecified error (request id ${request.id}):`)
          app.log.error(/** @type {any} */ (error))

          reply.code(500).send({ message: `InternalError: something went wrong (request id: ${request.id})` })
        }
      }
    ),
  )

  app.register(indexPlugin)

  app.log.info('Done initializing app')

  return app
}
