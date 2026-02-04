# Logger Package

Shared logging utility with Fastify integration and `LOG_LEVEL` environment variable support.

## Features

- Built on [Pino](https://getpino.io/) - Fast and low-overhead logging
- Configurable log level via `LOG_LEVEL` environment variable
- Pretty printing in development mode for better readability
- Fastify integration support
- Can be used standalone in any shared package

## Installation

The logger package is available as a workspace package and can be added as a dependency:

```json
{
  "dependencies": {
    "logger": "file:../shared/logger"
  }
}
```

## Usage

### Default Logger

Use the default logger instance for quick logging:

```javascript
import logger from 'logger'

logger.info('Application started')
logger.error('An error occurred', { error })
logger.debug('Debug information', { data })
```

### Custom Logger

Create a custom logger instance with specific options:

```javascript
import { createLogger } from 'logger'

const customLogger = createLogger({
  level: 'debug',
  // Any other pino options...
})

customLogger.debug('Custom logger message')
```

### Fastify Integration

Integrate the logger with Fastify:

```javascript
import fastify from 'fastify'
import { getFastifyLoggerConfig } from 'logger'

const app = fastify({
  logger: getFastifyLoggerConfig(),
})

// Use Fastify's logger
app.log.info('Server started')
```

## Log Levels

The logger supports the following log levels (from highest to lowest priority):

- `fatal` (60)
- `error` (50)
- `warn` (40)
- `info` (30) - **default**
- `debug` (20)
- `trace` (10)

Set the log level using the `LOG_LEVEL` environment variable:

```bash
LOG_LEVEL=debug node app.js
```

If `LOG_LEVEL` is not set or contains an invalid value, the logger defaults to `info` level.

## Development vs Production

- **Development** (`NODE_ENV=development`): Uses pretty printing with colors and human-readable timestamps
- **Production**: Uses JSON output for better machine parsing and log aggregation

## API

### `logger`

Default logger instance. Exported as both named and default export.

```javascript
import logger from 'logger'
// or
import { logger } from 'logger'
```

### `createLogger(options?: LoggerOptions)`

Create a new logger instance with custom options.

**Parameters:**

- `options` (optional): Pino logger options to override defaults

**Returns:** Pino logger instance

**Example:**

```javascript
import { createLogger } from 'logger'

const dbLogger = createLogger({ name: 'database' })
```

### `getFastifyLoggerConfig()`

Get Fastify-compatible logger configuration.

**Returns:** Logger configuration object for Fastify

**Example:**

```javascript
import { getFastifyLoggerConfig } from 'logger'
import fastify from 'fastify'

const app = fastify({
  logger: getFastifyLoggerConfig(),
})
```

## Testing

Run integration tests:

```bash
pnpm test "packages/shared/logger/test/**/*.spec.js"
```
