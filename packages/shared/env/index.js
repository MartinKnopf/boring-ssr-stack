/**
 * @fileoverview Environment variable loader and accessor.
 */

import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import logger from 'logger'

let imported = false

export default {
  init() {
    if (imported) {
      return
    }

    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const nodeEnv = process.env.NODE_ENV || 'development'
    const envPath = path.resolve(path.join(__dirname, '..', '..', '..', `.env.${nodeEnv}`))
    logger.debug(`Loading environment from: ${envPath}`)
    dotenv.config({ path: envPath, override: true })
    imported = true
  },

  /**
   * @param {string} key
   * @param {string} [defaultValue]
   * @returns {string}
   */
  get(key, defaultValue) {
    return process.env[key] || `${defaultValue}`
  }
}
