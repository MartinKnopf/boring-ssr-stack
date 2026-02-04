import { after, before, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import InmemoryApi from '../inmemoryApi.js'
import fetch from 'node-fetch'

/** @type {InmemoryApi} */
let api

/**
 * @param {string} url
 * @param {Record<string, string>} [headers]
 */
const get = async (url, headers = {}) => {
  try {
    const res = await fetch(`${url}`, { headers })
    return { status: res.status, body: res.body, headers: res.headers }
  } catch (error) {
    console.log(error)
    const err = /** @type {any} */ (error)
    return { status: err.response?.status, body: err.response?.data }
  }
}

before(async () => {
  api = await InmemoryApi.start(process.env.NODE_ENV === 'development')
})

after(async () => {
  await api.stop()
})

describe('Example Int Test', async () => {
  test('Should work', async () => {
    const { status } = await get(`http://localhost:${api.getPort()}/frontend`)

    assert.equal(status, 200, 'Status code should be 200')
  })
})
