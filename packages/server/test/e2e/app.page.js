export default class AppPage {
  /**
   * @param {import('./browser.js').default} browser
   */
  constructor(browser) {
    this.browser = browser
  }

  /**
   * @returns {Promise<string>} Page title
   */
  async getTitle() {
    return await this.browser.waitForAndEval('title', /** @param {any} el */ (el) => el.innerText)
  }
}
