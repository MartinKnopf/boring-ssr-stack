import { describe, test, before } from 'node:test'
import assert from 'node:assert/strict'
import env from '../../index.js'

describe('env package', () => {
  before(() => {
    // Ensure NODE_ENV is set to development for this test
    process.env.NODE_ENV = 'development'
  })

  test('should load .env.development file', () => {
    // Initialize env package
    env.init()

    // Verify environment variables from .env.development are loaded
    assert.equal(process.env.NODE_ENV, 'development', 'NODE_ENV should be set to development')

    assert.equal(process.env.API_HOST, 'http://localhost:8000', 'API_HOST should be loaded from .env.development')

    assert.equal(
      process.env.E2E_TEST_HOST,
      'http://localhost:8000/frontend',
      'E2E_TEST_HOST should be loaded from .env.development',
    )

    assert.equal(process.env.E2E_SLOWMO, '25', 'E2E_SLOWMO should be loaded from .env.development')
  })

  test('should not reload environment on subsequent calls', () => {
    // Call init again
    env.init()

    // Values should remain the same (idempotent)
    assert.equal(process.env.API_HOST, 'http://localhost:8000', 'API_HOST should remain unchanged on subsequent init calls')
  })
})
