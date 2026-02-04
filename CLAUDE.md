# CLAUDE.md

This file provides guidance to coding agents when working with code in this repository.

!!!IMPORTANT!!!
ALWAYS DO THIS WHEN STARTING A NEW TASK: Write a short one-liner about what your current task is in @TODO.md, so that human knows what it's working on. Otherwise they will loose track of their multiple parallel working sessions. You can overwrite the contents of TODO.md.

## Best Practices

- Read all README.md files from relevant modules for context.
- If you come accross an unkown business term or concept, look for it in docs/1-glossary.md. If it's not there, ask me for clarification.

### Code style

- Follow existing code style and conventions. We want a high degree of consistency and simplicity across the codebase.
- Look for patterns in similar files.
- Write modular, reusable code
- Try to use existing utilities and libraries (e.g. Alpine, HTMX) idiomatically.

### Keep It Simple

- Implement code in the fewest lines possible.
- Avoid over-engineering solutions.
- Choose straightforward approaches over clever ones.

### Optimize for Readability

- Prioritize code clarity over micro-optimizations.
- Write self-documenting code with clear variable names.
- Use meaningful variable and function names.
- Group related code together.
- Add brief but helpful comments to blocks of logic.
- Write valuable JSDoc comments for functions, classes, and all types. Avoid `any`, `{*}` and vague types. Introduce DTO types for function inputs/outputs where they are reused across module boundaries.

### DRY (Don't Repeat Yourself)

- Extract repeated business logic to private methods.
- Extract repeated UI markup to reusable components.
- Create utility functions for common operations.

### Testing

- Write valuable tests. Tests should validate observable behavior and meaning, not just implementation wiring:
  - Bad: `assert.ok(logMessage.length > 0, 'Should contain log message')`. Good: `assert.equal(logMessage, 'Expected log message', 'Should contain expected log message')`
  - Bad: `assert.equal(mockedFunction.callCount, 1, 'Function should be called once')` (ties test to implementation). Good: Verify outcome of unit under test instead.
  - Bad: `assert.ok(await this.pageObject.containsTitle('Dashboard'), 'Page should contain title')` (verification hidden in page object). Good: `assert.equal(await this.pageObject.getTitle(), 'Dashboard', 'Page title should be Dashboard')`
  - Bad: `assert.ok(await this.browser.containsElement('.my-element'), 'Element should exist')` (ties test to implementation). Good: `assert.equal(await this.pageObject.containsMyElement(), true, 'My element should exist')` (only ties page object to implementation)
- Write tests for new functionality.
- Maintain or improve existing test coverage.
- Test edge cases and error conditions.
- Group tests logically using `describe()` and use descriptive test names. E.g.: `describe('ReleaseService.createRelease')` and `it('should create a release with valid input')`.
- Provide brief block-level comments. E.g.:

  ```javascript
  // Verify modal is visible
  assert.ok(await releasePage.isImageComparisonModalVisible(), 'Modal should be visible')

  // Close modal
  await releasePage.closeImageComparisonModal()

  // Verify modal is closed
  assert.ok(!(await releasePage.isImageComparisonModalVisible()), 'Modal should be closed')
  ```

- Always look for opportunities to merge tests that share setup/teardown logic AND verify similar functionality.

### Dependencies

CHOOSE LIBRARIES WISELY

When adding third-party dependencies:

- Select the most popular and actively maintained option.
- Check the library's GitHub repository for:
  - Recent commits (within last 6 months)
  - Active issue resolution
  - Number of stars/downloads
  - Clear documentation

### Code Organization

#### File Structure

- Keep files focused on a single responsibility.
- Group related functionality together.
- Use consistent naming conventions.

## Development Commands

### Testing Commands

All tests run sequentially due to database constraints.

**Local Development Testing:**

Our test script `scripts/test.js` allows running specific test files or patterns with `pnpm test-file <pattern>`. By default, tests run against the development environment (`NODE_ENV=development`) with `LOG_LEVEL=error` to reduce noise.

- `pnpm test "**/*spec.js"` - Run all tests (unit, integration, e2e)
- `pnpm test "**/test/unit/*.spec.js"` - Run unit tests only
- `pnpm test "**/test/int/*.spec.js"` - Run integration tests only
- `pnpm test "**/test/e2e/*.spec.js"` - Run end-to-end tests only
- `pnpm test <glob path>` - Run a specific test file
- Running integration tests of all modules is slow, so prefer running the int tests of a specific module.
- Running all e2e tests is very slow, so prefer running specific ones from within the frontend application. You can run a specific tests by providing a filter like this: `pnpm test <path to test file> "<name of the test>"`
- Get code coverage with `COVERAGE=true pnpm test "<path|glob|fuzzy>`

### Code Quality

- `pnpm check` - Run ESLint and TypeScript type checking across all packages
- `pnpm format` - Format code with Prettier

## Architecture Overview

This is a **Turborepo monorepo** with pnpm workspace management, containing multiple applications and shared packages for the system.

### Key Applications (`packges/`)

- **`server/`** - Node.js/Fastify REST API backend with JWT authentication

### Key Shared Packages (`packges/shared/`)
- **`env/`** - Environment variable management accessor
- **`logger/`** - Logging utility with different log levels

### Technology Stack

- **Back end:** Node.js, Fastify
- **Front end:** Embedded in back end, Handlebars, HTMX, Alpine.js
- **Testing:** Node.js test runner, Playwright for E2E
- **Package Management:** pnpm with Turborepo orchestration
- **Version Control:** Git

### Environment Configuration

Uses `.env.development` and `.env.production` files. The `env` package loads appropriate configuration based on `NODE_ENV`.

## Development Notes

- Always assume the dev servers are running.
- If you encounter an expired AWS token error during testing, ask me to refresh the token.
- **CRITICAL: Always run `pnpm check` after making code changes and before declaring work complete.** This catches type errors and linting issues early.
- Keep JSDoc up-to-date with code changes.
- Always write tests for new functionality and maintain existing test coverage.
- Always run relevant tests and mention which tests you ran in your summary.
- After running tests, verify they pass and report the results.

## A Note To The Agent

We are building this together. When you learn something non-obvious, add it here so future changes go faster.
