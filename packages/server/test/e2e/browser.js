/**
 * @fileoverview Browser wrapper using Playwright in E2E tests.
 */

import { chromium } from 'playwright'
import env from 'env'

const DEFAULT_TIMEOUT = 30000

/**
 * Wraps selenium api to be more or less independant of the browser testing framework.
 * @class
 */
class Browser {
  constructor() {
    this.browser = undefined
    this.context = undefined
    this.page = undefined
  }

  /**
   * Launches the browser instance once (call in before() hook).
   */
  async launchBrowser() {
    try {
      env.init()

      const headlessOff = process.env.HEADLESS === 'false'

      const opts = {
        headless: !headlessOff,
        slowMo: parseInt(process.env.E2E_SLOWMO ?? '25'),
        timeout: DEFAULT_TIMEOUT,
        args: ['--no-sandbox'],
      }

      // Launch the browser once
      this.browser = await chromium.launch(opts)
    } catch (/** @type {any} */ err) {
      console.error(err)
      throw err
    }
  }

  /**
   * Creates a new browser context and page (call in beforeEach() hook).
   * @param {number} port - The port where the app is running.
   */
  async startBrowser(port) {
    try {
      if (!this.browser) {
        throw new Error('Browser not launched. Call launchBrowser() first.')
      }

      // Create new context (isolated cookies, localStorage, etc.)
      this.context = await this.browser.newContext({ viewport: { width: 1920 * 0.75, height: 1080 * 0.75 } })
      this.page = await this.context.newPage()

      // Open the iframe URL
      if (!process.env.E2E_TEST_HOST) {
        throw new Error('E2E_TEST_HOST environment variable not set')
      }
      await this.page.goto(process.env.E2E_TEST_HOST.replace(':8000', `:${port}`)) // Only replace port 8000, so this doesn't affect staging tests
    } catch (/** @type {any} */ err) {
      if (this.page?.close) {
        await this.page.close()
      }
      if (this.context?.close) {
        await this.context.close()
      }
      console.error(err)
      throw err
    }
  }

  /**
   * Closes the browser context (call in afterEach() hook).
   */
  async closeBrowser() {
    try {
      if (this.context?.close) {
        await this.context.close()
      }
      this.context = undefined
      this.page = undefined
    } catch (/** @type {any} */ err) {
      console.error(err)
    }
  }

  /**
   * Terminates the browser instance (call in after() hook).
   */
  async terminateBrowser() {
    try {
      if (this.browser?.close) {
        await this.browser.close()
      }
      this.browser = undefined
    } catch (/** @type {any} */ err) {
      console.error(err)
    }
  }

  /**
   * Implicitly waits for the element to be visible (see https://playwright.dev/docs/actionability) so we're polling here instead.
   * @param {string} selector - The CSS selector of the element to wait for.
   * @returns {Promise<import('playwright').ElementHandle | null>} - The element handle.
   */
  async waitForElement(selector) {
    if (!this.page) {
      throw new Error('No browser page available')
    }

    let waitTime = 0
    while (waitTime < DEFAULT_TIMEOUT) {
      const isContained = await this.page.evaluate(`document.querySelector('${selector}') != null`)
      if (isContained) {
        return this.page.$(selector)
      }
      await this.page.waitForTimeout(100)
      waitTime += 100
    }
    throw new Error(`Element '${selector}' not found`)
  }

  /** Implicitly waits for the element to be visible (see https://playwright.dev/docs/actionability) so we're polling here instead.
   * @param {string} selector - The CSS selector of the elements to wait for.
   * @returns {Promise<import('playwright').ElementHandle[]>} - The element handles.
   */
  async waitForAllElements(selector) {
    if (!this.page) {
      throw new Error('No browser page available')
    }

    let waitTime = 0
    while (waitTime < DEFAULT_TIMEOUT) {
      const isContained = await this.page.evaluate(`document.querySelectorAll('${selector}').length > 0`)
      if (isContained) {
        return await this.page.$$(selector)
      }
      await this.page.waitForTimeout(100)
      waitTime += 100
    }
    throw new Error(`Elements '${selector}' not found`)
  }

  /**
   * Waits for the element to be gone from the DOM.
   * @param {string} selector - The CSS selector of the element to wait for.
   */
  async waitForElementGone(selector) {
    if (!this.page) {
      throw new Error('No browser page available')
    }

    let isContained = await this.page.evaluate(`document.querySelector('${selector}') != null`)
    if (isContained) {
      let waitTime = 0
      while (waitTime < DEFAULT_TIMEOUT) {
        await this.page.waitForTimeout(100)
        waitTime += 100
        isContained = await this.page.evaluate(`document.querySelector('${selector}') != null`)
        if (!isContained) {
          return
        } // element is gone
      }
      throw new Error(`Element '${selector}' still there`)
    }
  }

  /**
   * Waits for the element to be visible and clicks it.
   * @param {string} selector - The CSS selector of the element to wait for and click.
   */
  async waitForAndClick(selector) {
    if (!this.page) {
      throw new Error('No browser page available')
    }

    await this.waitForElement(selector)
    return this.page.click(selector, { force: true })
  }

  /**
   * Clicks the element without waiting for it.
   * @param {string} selector - The CSS selector of the element to click.
   */
  async tryClick(selector) {
    if (!this.page) {
      throw new Error('No browser page available')
    }

    return this.page.click(selector, { force: true })
  }

  /**
   * Waits for the element to be visible and evaluates the handler function on it.
   * @param {string} selector - The CSS selector of the element to wait for and evaluate.
   * @param {any} handler - The function to evaluate on the element.
   */
  async waitForAndEval(selector, handler) {
    if (!this.page) {
      throw new Error('No browser page available')
    }

    await this.waitForElement(selector)
    return this.page.$eval(selector, handler)
  }

  /**
   * Waits for all elements to be visible and evaluates the handler function on them.
   * @param {string} selector - The CSS selector of the elements to wait for and evaluate.
   * @param {any} handler - The function to evaluate on the elements.
   */
  async waitForAllAndEval(selector, handler) {
    if (!this.page) {
      throw new Error('No browser page available')
    }

    await this.waitForAllElements(selector)
    return this.page.$$eval(selector, handler)
  }

  /**
   * Waits for the element to be visible and types the input value into it.
   * @param {string} selector - The CSS selector of the element to wait for and type into.
   * @param {string|number} inputValue - The value to type into the element.
   */
  async waitForAndType(selector, inputValue) {
    if (!this.page) {
      throw new Error('No browser page available')
    }

    await this.waitForElement(selector)
    await this.page.type(selector, `${inputValue}`, { delay: 10 })
  }

  /**
   * Waits for the element to be visible and checks or unchecks it based on the checkedValue.
   * @param {string} selector - The CSS selector of the element to wait for and check/uncheck.
   * @param {boolean|string|number} checkedValue - The value to check against. If true, the element will be checked; if false, it will be unchecked.
   */
  async waitForAndCheck(selector, checkedValue) {
    if (!this.page) {
      throw new Error('No browser page available')
    }

    await this.waitForElement(selector)
    const isChecked = await this.page.$eval(selector, (/** @type {any} */ el) => el.getAttribute('aria-checked') || el.value)
    if (isChecked != `${checkedValue}`) {
      await this.page.click(selector)
    }
  }

  /**
   * Waits for the dropdown to be visible, opens it, and selects the option at the given index.
   * @param {string} dropdownSelector - The CSS selector of the dropdown element to wait for and select from.
   * @param {number} index - The index of the option to select.
   */
  async waitForAndSelect(dropdownSelector, index) {
    if (!this.page) {
      throw new Error('No browser page available')
    }

    const dropdownSelectId = await this.waitForAndEval(`${dropdownSelector} input`, (/** @type {any} */ el) =>
      el.getAttribute('id'),
    )
    const optionSelector = `.q-menu#${dropdownSelectId}_lb #${dropdownSelectId}_${index}`

    await this.waitForAndClick(dropdownSelector)
    // Wait for dropdown menu to appear
    await this.waitForElement(`.q-menu#${dropdownSelectId}_lb`)
    await this.waitForAndClick(optionSelector)
    // Wait for dropdown menu to disappear
    await this.waitForElementGone(`.q-menu#${dropdownSelectId}_lb`)
  }

  /**
   * Checks if the element is contained in the DOM.
   * @param {string} selector - The CSS selector of the element to check.
   * @returns {Promise<boolean>} - True if the element is contained, false otherwise.
   */
  async containsElement(selector) {
    if (!this.page) {
      throw new Error('No browser page available')
    }

    const isContained = await this.page.evaluate(`document.querySelector('${selector}') != null`)
    return isContained
  }

  /**
   * Checks if the element is disabled.
   * @param {string} selector - The CSS selector of the element to check.
   * @returns {Promise<boolean>} - True if the element is disabled, false otherwise.
   */
  async isDisabled(selector) {
    const el = await this.waitForElement(selector)
    if (!el) {
      throw new Error(`Element '${selector}' not found`)
    }
    return el.isDisabled()
  }

  /**
   * Clears the input field by simulating backspace key presses.
   * @param {string} selector - The CSS selector of the input element to clear.
   */
  async clearInput(selector) {
    if (!this.page) {
      throw new Error('No browser page available')
    }

    const input = await this.waitForElement(selector)
    if (!input) {
      throw new Error(`Element '${selector}' not found`)
    }
    const val = await this.page.$eval(selector, (/** @type {any} */ el) => el.value)
    await input.click()
    for (let i = 0; i < val.length; i++) {
      await input.press('ArrowRight')
    } // make sure the cursor is at the end of the input value
    for (let i = 0; i < val.length; i++) {
      await input.press('Backspace')
    }
  }

  async waitForSeconds(duration = 1) {
    if (!this.page) {
      throw new Error('No browser page available')
    }

    await this.page.waitForTimeout(duration * 1000)
  }

  /**
   * Reloads the browser page.
   */
  async reload() {
    if (!this.page) {
      throw new Error('No browser page available')
    }

    await this.page.reload()
  }

  /**
   * Waits for the element to be visible and presses the given key on it.
   * @param {string} selector - The CSS selector of the element to wait for and press the key on.
   * @param {string} key - The key to press.
   */
  async waitForAndPress(selector, key) {
    const input = await this.waitForElement(selector)
    if (!input) {
      throw new Error(`Element '${selector}' not found`)
    }
    await input.press(key)
  }

  /**
   * Gets the current URL of the browser page.
   */
  async getUrl() {
    if (!this.page) {
      throw new Error('No browser page available')
    }

    return await this.page.url()
  }

  /**
   * Navigates to the given URL.
   * @param {string|undefined} url - The URL to navigate to.
   */
  async goto(url) {
    if (!url) {
      throw new Error('No URL provided to goto')
    }
    if (!this.page) {
      throw new Error('No browser page available')
    }

    await this.page.goto(url)
  }

  /**
   * Presses the given key on the keyboard.
   * @param {string} key - The key to press.
   */
  async pressKey(key) {
    if (!this.page) {
      throw new Error('No browser page available')
    }

    await this.page.keyboard.press(key)
  }

  /**
   * Re-route all requests to dev server to the in-memory API server.
   * @param {string} url - The URL of the request.
   * @param {{status: number, body: string}} response - The response object.
   */
  async interceptRoute(url, response) {
    if (!this.page) {
      throw new Error('No browser page available')
    }

    await this.page.route(url, async (route) => {
      await route.fulfill(response)
    })
  }
}

export default Browser
