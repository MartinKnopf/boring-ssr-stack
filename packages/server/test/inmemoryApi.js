/**
 * @fileoverview In-memory API server for testing purposes. Runs the Fastify app on a dynamic port.
 */

import getPort from 'get-port'
import build from '../src/app.js'

class InmemoryApi {
  constructor() {
    /** @type {import('fastify').FastifyInstance | undefined} */
    this.api = undefined
    /** @type {number | undefined} */
    this.port = undefined
    /** @type {string | undefined} */
    this.host = undefined
  }

  static async start(inmemory = true) {
    const instance = new InmemoryApi()

    // Use inmemory api in development
    if (inmemory) {
      const port = await getPort()
      instance.port = port
      instance.host = `http://localhost:${port}`
    } else {
      // Use staging api in staging
      instance.port = 433
      instance.host = process.env.API_HOST
    }

    instance.api = await build()
    await instance.api.listen({ port: instance.port })

    return instance
  }

  /**
   * @returns {number}
   */
  getPort() {
    if (!this.port) {
      throw new Error('Port not initialized')
    }
    return this.port
  }

  /**
   * @returns {string}
   */
  getHost() {
    if (!this.host) {
      throw new Error('Host not initialized')
    }
    return this.host
  }

  async stop() {
    if (this.api) {
      await this.api.close()
    }
  }
}

export default InmemoryApi
