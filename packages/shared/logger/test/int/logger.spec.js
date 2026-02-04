import { describe, test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createLogger, getFastifyLoggerConfig, logger } from '../../index.js'

describe('logger package', () => {
  /** @type {string | undefined} */
  let originalLogLevel

  before(() => {
    // Save original LOG_LEVEL
    originalLogLevel = process.env.LOG_LEVEL
  })

  after(() => {
    // Restore original LOG_LEVEL
    if (originalLogLevel !== undefined) {
      process.env.LOG_LEVEL = originalLogLevel
    } else {
      delete process.env.LOG_LEVEL
    }
  })

  test('default logger should be defined', () => {
    assert.ok(logger, 'Default logger should exist')
    assert.equal(typeof logger.info, 'function', 'Logger should have info method')
    assert.equal(typeof logger.error, 'function', 'Logger should have error method')
    assert.equal(typeof logger.warn, 'function', 'Logger should have warn method')
    assert.equal(typeof logger.debug, 'function', 'Logger should have debug method')
  })

  test('createLogger should create a new logger instance', () => {
    const customLogger = createLogger()
    assert.ok(customLogger, 'Custom logger should be created')
    assert.equal(typeof customLogger.info, 'function', 'Custom logger should have info method')
  })

  test('createLogger should accept custom options', () => {
    const customLogger = createLogger({ level: 'debug' })
    assert.ok(customLogger, 'Custom logger with options should be created')
    assert.equal(customLogger.level, 'debug', 'Custom logger should have debug level')
  })

  test('logger should respect LOG_LEVEL environment variable', () => {
    // Set LOG_LEVEL to warn
    process.env.LOG_LEVEL = 'warn'

    // Create a new logger with the updated env var
    const warnLogger = createLogger()
    assert.equal(warnLogger.level, 'warn', 'Logger should use warn level from LOG_LEVEL')

    // Set LOG_LEVEL to error
    process.env.LOG_LEVEL = 'error'
    const errorLogger = createLogger()
    assert.equal(errorLogger.level, 'error', 'Logger should use error level from LOG_LEVEL')
  })

  test('logger should default to info level for invalid LOG_LEVEL', () => {
    process.env.LOG_LEVEL = 'invalid-level'
    const defaultLogger = createLogger()
    assert.equal(defaultLogger.level, 'info', 'Logger should default to info level for invalid LOG_LEVEL')
  })

  test('getFastifyLoggerConfig should return logger configuration', () => {
    process.env.LOG_LEVEL = 'debug'
    const config = getFastifyLoggerConfig()

    assert.ok(config, 'Fastify logger config should be defined')
    // Config can be true (boolean) or LoggerOptions object
    if (typeof config === 'boolean') {
      assert.equal(config, true, 'Fastify logger config should be true if boolean')
    } else {
      assert.equal(config.level, 'debug', 'Fastify logger config should have correct level')
    }
  })

  test('logger should handle different log levels', () => {
    const levels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace']

    levels.forEach((level) => {
      process.env.LOG_LEVEL = level
      const testLogger = createLogger()
      assert.equal(testLogger.level, level, `Logger should support ${level} level`)
    })
  })
})
