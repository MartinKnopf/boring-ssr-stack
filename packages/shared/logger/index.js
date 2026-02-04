/**
 * @fileoverview Logger utility using pino.
 */

import pino from 'pino'

/**
 * Valid pino log levels
 * @type {Record<string, number>}
 */
const LOG_LEVELS = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
}

/**
 * Get the log level from environment variable
 * @returns {string} The log level
 */
function getLogLevel() {
  const level = (process.env.LOG_LEVEL || 'info').toLowerCase()
  return LOG_LEVELS[level] !== undefined ? level : 'info'
}

/**
 * Get base logger options
 * @returns {import('pino').LoggerOptions} Pino logger options
 */
function getBaseLoggerOptions() {
  const level = getLogLevel()
  const isDevelopment = process.env.NODE_ENV === 'development'

  return {
    level,
    // Use pretty printing in development for better readability
    ...(isDevelopment && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
    }),
  }
}

/**
 * Create a new logger instance
 * @param {Partial<import('pino').LoggerOptions>} [options] - Additional pino options
 * @returns {import('pino').Logger} Pino logger instance
 */
export function createLogger(options = {}) {
  const baseOptions = getBaseLoggerOptions()
  return pino({ ...baseOptions, ...options })
}

/**
 * Get Fastify-compatible logger configuration
 * @returns {import('pino').LoggerOptions | boolean} Logger configuration for Fastify
 */
export function getFastifyLoggerConfig() {
  return getBaseLoggerOptions()
}

/**
 * Default logger instance
 * Use this for logging in shared packages
 */
export const logger = createLogger()

export default logger
