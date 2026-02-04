import { after, afterEach, before, beforeEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import env from 'env'
import Browser from './browser.js'
import InmemoryApi from '../inmemoryApi.js'
import AppPage from './app.page.js'

env.init()

const browser = new Browser()
const appPage = new AppPage(browser)

/** @type {InmemoryApi} */
let api

before(async () => {
  api = await InmemoryApi.start(process.env.NODE_ENV === 'development')
  await browser.launchBrowser()
})

after(async () => {
  await browser.terminateBrowser()
  await api.stop()
})

beforeEach(async () => {
  await browser.startBrowser(api.getPort())
})

afterEach(async () => {
  await browser.closeBrowser()
})

describe('Example E2E Test', async () => {
  test('should work', async () => {
    assert.equal(await appPage.getTitle(), 'Boring SSR Stack', 'Should show the correct page title')
  })
})
