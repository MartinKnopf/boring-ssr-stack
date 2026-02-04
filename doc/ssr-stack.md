# SSR Stack Reference

A modern server-side rendering (SSR) stack using Node.js, Fastify, Handlebars, HTMX, and Alpine.js. This document serves as a reference for building progressive enhancement web applications with server-rendered HTML and lightweight client-side interactivity.

## Stack Overview

**Runtime & Package Management**

- Node.js 20+
- pnpm (package manager)
- Turborepo (monorepo orchestration)

**Server**

- Fastify 5 (web framework)
- `@fastify/view` with Handlebars (templating)
- `@fastify/static` (static file serving)
- `@fastify/formbody` (form parsing)
- `fastify-plugin` (plugin encapsulation)

**Templating**

- Handlebars (server-side rendering)
- Layout system with partials and fragments

**Frontend Interactivity**

- HTMX (declarative partial updates, `hx-boost`, SSE)
- Alpine.js (client-side reactivity and state)

**Styling**

- Pico CSS (classless semantic base)
- Tailwind CSS v4 (utility classes, no Preflight)
- CSS cascade layers for style isolation
- `@tailwindcss/cli` for build-time processing

**JavaScript Bundling**

- Rollup with `@rollup/plugin-node-resolve` and `@rollup/plugin-replace`
- ES module output

**Type Checking**

- JSDoc annotations for type information
- TypeScript compiler (`tsc --noEmit`) with `checkJs: true`
- No TypeScript compilation, pure JavaScript runtime

**Code Quality**

- ESLint (linting)
- Prettier (formatting)

**Testing**

- Node.js built-in test runner (`node:test` + `node:assert/strict`)
- Unit tests (pure logic)
- Integration tests (InmemoryApi harness)
- E2E tests (Playwright with Page Object pattern)

**Dev Workflow**

- `concurrently` for parallel watch tasks
- `nodemon` for server auto-restart
- Dev server on port 8000

## Project Structure

```
project/
├── packages/
│   └── server/
│       ├── src/
│       │   ├── api/
│       │   │   └── routes/
│       │   │       └── index/
│       │   │           ├── index.plugin.js
│       │   │           └── index.router.js
│       │   ├── frontend/
│       │   │   ├── assets/
│       │   │   │   ├── 404.svg
│       │   │   │   └── access-denied.svg
│       │   │   ├── components/
│       │   │   │   └── footer/
│       │   │   │       ├── footer.component.html
│       │   │   │       └── footer.component.css
│       │   │   ├── css/
│       │   │   │   └── style.css
│       │   │   ├── pages/
│       │   │   │   └── index/
│       │   │   │       ├── index.page.html
│       │   │   │       ├── index.page.css
│       │   │   │       ├── index.plugin.js
│       │   │   │       └── index.router.js
│       │   │   ├── scripts/
│       │   │   │   └── bundle-frontend.js
│       │   │   ├── layout.html
│       │   │   └── main.js
│       │   ├── app.js
│       │   └── server.js
│       ├── test/
│       │   ├── api/
│       │   │   └── someApiTest.spec.js
│       │   ├── e2e/
│       │   │   ├── app.page.js
│       │   │   └── app.spec.js
│       │   ├── int/
│       │   │   └── someIntTest.spec.js
│       │   ├── unit/
│       │   │   └── someUnitTest.spec.js
│       │   ├── browser.js
│       │   └── inmemoryApi.js
│       ├── index.js
│       ├── package.json
│       └── rollup.config.js
├── scripts/
│   └── test.js
├── turbo.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc.json
└── package.json
```

## File Naming Conventions

- `*.plugin.js` - Fastify plugin files
- `*.router.js` - Route definition files
- `*.service.js` - Business logic service files
- `*.page.html` - Full page templates
- `*.component.html` - Reusable component templates
- `*.fragment.html` - Partial HTML fragments for HTMX
- `*.module.js` - Frontend JavaScript modules
- `*.page.css` - Page-specific styles
- `*.component.css` - Component-specific styles
- `*.spec.js` - Test files

## Configuration Files

### Root `package.json`

```json
{
  "name": "project-root",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "test:file": "node scripts/test.js",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{js,json,md,html,css}\""
  },
  "devDependencies": {
    "prettier": "^3.0.0",
    "turbo": "^2.0.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - 'packages/*'
```

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {}
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "noEmit": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "resolveJsonModule": true
  },
  "include": ["packages/**/*.js"],
  "exclude": ["node_modules", "dist"]
}
```

### `.eslintrc.json`

```json
{
  "env": {
    "node": true,
    "es2022": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": "warn"
  }
}
```

### `.prettierrc.json`

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "es5",
  "arrowParens": "avoid"
}
```

### Server `package.json`

```json
{
  "name": "server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "concurrently \"pnpm:dev:*\"",
    "dev:frontend": "node src/frontend/scripts/bundle-frontend.js --watch",
    "dev:server": "nodemon --watch src --ext js,html,css index.js",
    "build": "node src/frontend/scripts/bundle-frontend.js",
    "start": "node index.js",
    "test": "node --test test/**/*.spec.js",
    "test:unit": "node --test test/unit/**/*.spec.js",
    "test:int": "node --test test/int/**/*.spec.js",
    "test:e2e": "node --test test/e2e/**/*.spec.js",
    "lint": "eslint src test",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@fastify/formbody": "^8.0.0",
    "@fastify/static": "^7.0.0",
    "@fastify/view": "^9.0.0",
    "fastify": "^5.0.0",
    "fastify-plugin": "^5.0.0",
    "handlebars": "^4.7.8"
  },
  "devDependencies": {
    "@playwright/browser-chromium": "^1.40.0",
    "@rollup/plugin-node-resolve": "^15.2.0",
    "@rollup/plugin-replace": "^5.0.5",
    "@tailwindcss/cli": "^4.0.0",
    "concurrently": "^8.2.0",
    "eslint": "^8.50.0",
    "get-port": "^7.0.0",
    "nodemon": "^3.0.0",
    "playwright": "^1.40.0",
    "rollup": "^4.0.0"
  }
}
```

### `rollup.config.js`

```javascript
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'

export default {
  input: 'src/frontend/main.js',
  output: {
    file: 'dist/assets/bundle.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      preventAssignment: true,
    }),
  ],
}
```

## Fastify Application

### `app.js` - Application Factory

```javascript
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Fastify from 'fastify'
import fastifyView from '@fastify/view'
import fastifyStatic from '@fastify/static'
import fastifyFormbody from '@fastify/formbody'
import Handlebars from 'handlebars'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Creates and configures a Fastify application instance
 * @param {object} options - Fastify options
 * @param {boolean} [options.logger=true] - Enable logging
 * @returns {Promise<import('fastify').FastifyInstance>} Configured Fastify instance
 */
export async function buildApp(options = {}) {
  const app = Fastify({
    logger: options.logger ?? true,
  })

  // Register form body parser
  await app.register(fastifyFormbody)

  // Register static file serving
  await app.register(fastifyStatic, {
    root: path.join(__dirname, 'frontend/assets'),
    prefix: '/assets/',
  })

  await app.register(fastifyStatic, {
    root: path.join(__dirname, '../dist/assets'),
    prefix: '/assets/',
    decorateReply: false,
  })

  // Register Handlebars view engine
  await app.register(fastifyView, {
    engine: {
      handlebars: Handlebars,
    },
    root: path.join(__dirname, 'frontend'),
    layout: 'layout.html',
    viewExt: 'html',
    options: {
      partials: {
        // Auto-register all partials from components and fragments
      },
    },
  })

  // Register application routes
  await app.register(import('./api/routes/index/index.plugin.js'))

  return app
}
```

### `server.js` - Server Entry Point

```javascript
import { buildApp } from './app.js'

const PORT = process.env.PORT || 8000
const HOST = process.env.HOST || '0.0.0.0'

/**
 * Start the server
 */
async function start() {
  const app = await buildApp()

  try {
    await app.listen({ port: PORT, host: HOST })
    app.log.info(`Server listening on http://${HOST}:${PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
```

### `index.js` - Lambda-Style Entry Point

```javascript
import { buildApp } from './src/app.js'

let appInstance

/**
 * Get or create app instance (singleton pattern for serverless)
 * @returns {Promise<import('fastify').FastifyInstance>}
 */
async function getApp() {
  if (!appInstance) {
    appInstance = await buildApp({ logger: false })
    await appInstance.ready()
  }
  return appInstance
}

export { getApp }
```

## Frontend Architecture

### Handlebars Templating

#### `layout.html` - Main Layout

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{title}}</title>
    <link rel="stylesheet" href="/assets/styles.css" />
    <script src="https://unpkg.com/htmx.org@1.9.10"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.13.3/dist/cdn.min.js"></script>
    <script type="module" src="/assets/bundle.js"></script>
  </head>
  <body hx-boost="true">
    <main>{{{body}}}</main>
    {{> footer}}
  </body>
</html>
```

#### Page Template (`pages/index/index.page.html`)

```html
<article>
  <header>
    <h1>{{heading}}</h1>
  </header>

  <section>
    <p>{{description}}</p>
  </section>

  <!-- HTMX partial update example -->
  <div hx-get="/api/content" hx-trigger="load" hx-swap="innerHTML">Loading...</div>

  <!-- Alpine.js reactivity example -->
  <div x-data="{ count: 0 }">
    <button @click="count++">Increment</button>
    <span x-text="count"></span>
  </div>
</article>
```

#### Component (`components/footer/footer.component.html`)

```html
<footer>
  <p>&copy; {{year}} - Built with Fastify, HTMX, and Alpine.js</p>
</footer>
```

#### Fragment (`fragments/content.fragment.html`)

```html
<div>
  <h3>{{title}}</h3>
  <p>{{body}}</p>
</div>
```

### Route Plugin Pattern

#### `index.plugin.js`

```javascript
import fastifyPlugin from 'fastify-plugin'
import { indexRouter } from './index.router.js'

/**
 * Index route plugin
 * @param {import('fastify').FastifyInstance} fastify
 */
async function indexPlugin(fastify) {
  fastify.register(indexRouter, { prefix: '/' })
}

export default fastifyPlugin(indexPlugin)
```

#### `index.router.js`

```javascript
/**
 * Index page routes
 * @param {import('fastify').FastifyInstance} fastify
 */
export async function indexRouter(fastify) {
  // Render full page
  fastify.get('/', async (request, reply) => {
    return reply.view('pages/index/index.page.html', {
      title: 'Home',
      heading: 'Welcome',
      description: 'Server-rendered with progressive enhancement',
      year: new Date().getFullYear(),
    })
  })

  // Return partial fragment for HTMX
  fastify.get('/api/content', async (request, reply) => {
    return reply.view(
      'fragments/content.fragment.html',
      {
        title: 'Dynamic Content',
        body: 'This was loaded via HTMX',
      },
      { layout: false },
    )
  })

  // Server-Sent Events endpoint
  fastify.get('/api/stream', async (request, reply) => {
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })

    let count = 0
    const interval = setInterval(() => {
      reply.raw.write(`data: ${JSON.stringify({ count: ++count })}\n\n`)

      if (count >= 10) {
        clearInterval(interval)
        reply.raw.end()
      }
    }, 1000)

    request.raw.on('close', () => {
      clearInterval(interval)
    })
  })
}
```

## Frontend Build Pipeline

### `bundle-frontend.js` - Build Script

```javascript
import { spawn } from 'node:child_process'
import { copyFile, mkdir } from 'node:fs/promises'
import { watch } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { rollup } from 'rollup'
import rollupConfig from '../../../rollup.config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DIST_DIR = path.join(__dirname, '../../../dist/assets')
const CSS_INPUT = path.join(__dirname, '../css/style.css')
const CSS_OUTPUT = path.join(DIST_DIR, 'styles.css')

/**
 * Build CSS using Tailwind CLI
 * @returns {Promise<void>}
 */
async function buildCSS() {
  console.log('Building CSS...')
  return new Promise((resolve, reject) => {
    const tailwind = spawn('npx', ['@tailwindcss/cli', '-i', CSS_INPUT, '-o', CSS_OUTPUT], {
      stdio: 'inherit',
    })

    tailwind.on('close', (code) => {
      if (code === 0) {
        console.log('CSS built successfully')
        resolve()
      } else {
        reject(new Error(`Tailwind CLI exited with code ${code}`))
      }
    })
  })
}

/**
 * Build JavaScript using Rollup
 * @returns {Promise<void>}
 */
async function buildJS() {
  console.log('Building JS...')
  const bundle = await rollup(rollupConfig)
  await bundle.write(rollupConfig.output)
  await bundle.close()
  console.log('JS built successfully')
}

/**
 * Copy static assets
 * @returns {Promise<void>}
 */
async function copyAssets() {
  console.log('Copying assets...')
  await mkdir(DIST_DIR, { recursive: true })
  // Add asset copy logic here
  console.log('Assets copied successfully')
}

/**
 * Run full build
 * @returns {Promise<void>}
 */
async function build() {
  try {
    await mkdir(DIST_DIR, { recursive: true })
    await Promise.all([buildCSS(), buildJS(), copyAssets()])
    console.log('Build complete!')
  } catch (error) {
    console.error('Build failed:', error)
    process.exit(1)
  }
}

/**
 * Watch mode for development
 */
async function watchMode() {
  console.log('Starting watch mode...')

  // Initial build
  await build()

  // Watch CSS files
  watch(path.join(__dirname, '../css'), { recursive: true }, async (eventType, filename) => {
    console.log(`CSS file changed: ${filename}`)
    await buildCSS()
  })

  // Watch JS files
  watch(path.join(__dirname, '..'), { recursive: true }, async (eventType, filename) => {
    if (filename?.endsWith('.js') && !filename.includes('scripts/')) {
      console.log(`JS file changed: ${filename}`)
      await buildJS()
    }
  })

  console.log('Watching for changes...')
}

// Run build or watch based on CLI args
const isWatch = process.argv.includes('--watch') || process.argv.includes('-w')

if (isWatch) {
  watchMode()
} else {
  build()
}
```

## CSS Architecture

### `style.css` - Main Stylesheet

```css
/* Import Pico CSS (classless semantic base) */
@import '@picocss/pico/css/pico.min.css';

/* Import Tailwind base, components, utilities */
@import 'tailwindcss';

/* CSS Layers for cascade control */
@layer base {
  /* Pico CSS provides the base layer */
}

@layer components {
  /* Component-specific styles */
  .card {
    @apply rounded-lg shadow-md p-4;
  }
}

@layer utilities {
  /* Custom utility classes */
  .text-balance {
    text-wrap: balance;
  }
}

/* Page-specific imports */
@import '../pages/index/index.page.css';

/* Component-specific imports */
@import '../components/footer/footer.component.css';
```

### `tailwind.config.js` (if needed for v4)

```javascript
export default {
  content: ['./src/frontend/**/*.{html,js}'],
  corePlugins: {
    preflight: false, // Disable Preflight, use Pico CSS base
  },
}
```

## HTMX Patterns

### Progressive Enhancement with `hx-boost`

```html
<!-- Automatically AJAX-ify all links and forms -->
<body hx-boost="true">
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>

  <main>{{{body}}}</main>
</body>
```

### Partial Updates

```html
<!-- Load content on trigger -->
<div hx-get="/api/users" hx-trigger="click" hx-swap="innerHTML" hx-target="#results">Load Users</div>

<div id="results"></div>
```

### Forms with HTMX

```html
<form hx-post="/api/submit" hx-target="#response" hx-swap="innerHTML">
  <input type="text" name="username" required />
  <button type="submit">Submit</button>
</form>

<div id="response"></div>
```

### Server-Sent Events

```html
<div hx-ext="sse" sse-connect="/api/stream" sse-swap="message" hx-swap="innerHTML">Waiting for updates...</div>
```

### Loading States

```html
<button hx-get="/api/slow" hx-indicator="#spinner">Load Data</button>

<div id="spinner" class="htmx-indicator">Loading...</div>
```

## Alpine.js Patterns

### Basic Reactivity

```html
<div x-data="{ open: false }">
  <button @click="open = !open">Toggle</button>
  <div x-show="open">Content</div>
</div>
```

### Component State

```html
<div x-data="counter()">
  <button @click="increment">+</button>
  <span x-text="count"></span>
  <button @click="decrement">-</button>
</div>

<script>
  function counter() {
    return {
      count: 0,
      increment() {
        this.count++
      },
      decrement() {
        this.count--
      },
    }
  }
</script>
```

### Form Validation

```html
<form x-data="{ email: '', isValid: false }" @submit.prevent="submit">
  <input type="email" x-model="email" @input="isValid = $el.validity.valid" />
  <button :disabled="!isValid">Submit</button>
</form>
```

### Integration with HTMX

```html
<div
  x-data="{ items: [] }"
  hx-get="/api/items"
  hx-trigger="load"
  @htmx:after-swap="items = JSON.parse($event.detail.xhr.response)"
>
  <template x-for="item in items">
    <div x-text="item.name"></div>
  </template>
</div>
```

## Frontend JavaScript Modules

### `main.js` - Entry Point

```javascript
import { initializeApp } from './modules/app.module.js'
import { setupEventListeners } from './modules/events.module.js'

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  initializeApp()
  setupEventListeners()
})

// HTMX event listeners
document.body.addEventListener('htmx:afterSwap', (event) => {
  console.log('Content swapped:', event.detail)
})

document.body.addEventListener('htmx:beforeRequest', (event) => {
  console.log('Request starting:', event.detail)
})
```

### `app.module.js`

```javascript
/**
 * Initialize application
 */
export function initializeApp() {
  console.log('App initialized')
  // Add global app initialization logic
}

/**
 * Get API base URL
 * @returns {string}
 */
export function getApiUrl() {
  return process.env.API_URL || ''
}
```

## Testing

### Test Runner Script - `scripts/test.js`

A convenient test runner with fuzzy search, glob patterns, and test name filtering.

```javascript
#!/usr/bin/env node

/**
 * Small helper to run a single Node test file with an optional test name filter.
 * Supports fuzzy search to quickly find test files by name.
 *
 * Usage:
 *   node scripts/test.js <path-or-pattern> ["test name pattern"]
 *
 * Environment:
 *   COVERAGE=true   Enable Node.js test coverage reporting
 */
import { spawnSync } from 'node:child_process'
import { existsSync, globSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Check if a string contains glob syntax
 */
function hasGlobSyntax(str) {
  return /[*?[\]{]/.test(str)
}

/**
 * Get the repository root directory (where package.json lives)
 */
function getRepoRoot() {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  return resolve(__dirname, '..')
}

/**
 * Find all test files in the repository
 */
function findAllTestFiles() {
  const root = getRepoRoot()
  const patterns = ['**/test/**/*.spec.js']

  const files = []
  for (const pattern of patterns) {
    const matches = globSync(pattern, { cwd: root })
    files.push(...matches.map((f) => resolve(root, f)))
  }

  return files.sort()
}

/**
 * Fuzzy match: check if all characters from query appear in order in the file path
 * Returns { matches: boolean, score: number } where higher score = tighter match
 * Score is calculated as queryLength / span (1.0 = perfect, chars adjacent)
 */
function matchesQuery(filePath, query) {
  const pathLower = filePath.toLowerCase()
  const queryLower = query.toLowerCase()

  let queryIndex = 0
  let firstPos = -1
  let lastPos = -1

  for (let i = 0; i < pathLower.length && queryIndex < queryLower.length; i++) {
    if (pathLower[i] === queryLower[queryIndex]) {
      if (firstPos === -1) {
        firstPos = i
      }
      lastPos = i
      queryIndex++
    }
  }

  const matches = queryIndex === queryLower.length
  if (!matches) {
    return { matches: false, score: 0 }
  }

  const span = lastPos - firstPos + 1
  const score = queryLower.length / span

  return { matches: true, score }
}

/**
 * Calculate simple similarity score for suggestions
 * Uses character overlap between query and filename
 */
function getSimilarityScore(filePath, query) {
  const filename = basename(filePath, '.spec.js').toLowerCase()
  const queryLower = query.toLowerCase()

  // Count matching characters in order
  let score = 0
  let queryIndex = 0
  for (const char of filename) {
    if (queryIndex < queryLower.length && char === queryLower[queryIndex]) {
      score++
      queryIndex++
    }
  }

  return score
}

/**
 * Get similar files for suggestions when no matches found
 */
function getSuggestions(files, query, maxSuggestions = 5) {
  return files
    .map((f) => ({ path: f, score: getSimilarityScore(f, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions)
    .map((item) => item.path)
}

/**
 * Resolve file path argument to actual test file(s)
 * Returns { file: string, alternatives: string[], isGlob: boolean } or throws error
 */
function resolveTestFile(arg) {
  // Case 1: Glob syntax - return as-is for node --test to handle
  if (hasGlobSyntax(arg)) {
    return { file: arg, alternatives: [], isGlob: true }
  }

  // Case 2: Existing file - run it directly
  if (existsSync(arg)) {
    return { file: arg, alternatives: [], isGlob: false }
  }

  // Case 3: Fuzzy search
  const allFiles = findAllTestFiles()
  const matchResults = allFiles
    .map((f) => ({ file: f, ...matchesQuery(f, arg) }))
    .filter((result) => result.matches)
    .sort((a, b) => b.score - a.score) // Sort by score descending (best match first)

  if (matchResults.length === 0) {
    // No matches - provide suggestions
    const suggestions = getSuggestions(allFiles, arg)
    const error = new Error(`No test files found matching "${arg}"`)
    error.suggestions = suggestions
    throw error
  }

  if (matchResults.length === 1) {
    // Exactly one match
    return { file: matchResults[0].file, alternatives: [], isGlob: false }
  }

  // Multiple matches - use best scored match, list others
  return {
    file: matchResults[0].file,
    alternatives: matchResults.slice(1).map((r) => r.file),
    isGlob: false,
  }
}

const [, , fileArg, testNamePattern] = process.argv

// Show help
if (!fileArg || fileArg === '--help' || fileArg === '-h') {
  console.log(`
Usage: node scripts/test.js <path-or-pattern> ["test name pattern"]

Arguments:
  <path-or-pattern>     File path, glob pattern, or search term
  ["test name pattern"] Optional: filter tests by name

Examples:
  node scripts/test.js packages/server/test/int/releases.spec.js # Specific file
  node scripts/test.js "packages/**/int/*.spec.js"               # Glob pattern
  node scripts/test.js some-test                                 # Fuzzy search

Environment:
  COVERAGE=true   Enable Node.js test coverage reporting
`)
  process.exit(fileArg ? 0 : 1)
}

// Resolve the file argument
let filePath
try {
  const result = resolveTestFile(fileArg)
  filePath = result.file

  if (!result.isGlob) {
    // Print which file was selected
    console.log(`\x1b[36m> Running: ${filePath}\x1b[0m`)

    if (result.alternatives.length > 0) {
      console.log(`\x1b[33m> Other matches (${result.alternatives.length}):\x1b[0m`)
      for (const alt of result.alternatives.slice(0, 10)) {
        console.log(`  - ${alt}`)
      }
      if (result.alternatives.length > 10) {
        console.log(`  ... and ${result.alternatives.length - 10} more`)
      }
      console.log()
    }
  }
} catch (error) {
  console.error(`\x1b[31mError: ${error.message}\x1b[0m`)
  if (error.suggestions?.length > 0) {
    console.error('\nDid you mean one of these?')
    for (const suggestion of error.suggestions) {
      console.error(`  - ${suggestion}`)
    }
  }
  process.exit(1)
}

process.env.NODE_ENV ||= 'development'
process.env.LOG_LEVEL ||= 'error'

const nodeArgs = ['--test']

if (process.env.COVERAGE === 'true') {
  nodeArgs.push('--experimental-test-coverage')
}

if (testNamePattern) {
  nodeArgs.push(`--test-name-pattern=${testNamePattern}`)
}

nodeArgs.push('--test-reporter=spec')

nodeArgs.push(filePath)

const result = spawnSync('node', nodeArgs, { stdio: 'inherit' })

// propagate the child process exit code; default to 1 on null to signal failure
process.exit(result.status ?? 1)
```

**Usage Examples:**

```bash
# Run specific test file
node scripts/test.js packages/server/test/int/releases.spec.js

# Run tests matching glob pattern
node scripts/test.js "packages/**/int/*.spec.js"

# Fuzzy search for test file
node scripts/test.js releases

# Run specific test by name pattern
node scripts/test.js releases "should create release"

# Run with coverage
COVERAGE=true node scripts/test.js releases
```

### Test Harness - `inmemoryApi.js`

```javascript
import { buildApp } from '../src/app.js'
import getPort from 'get-port'

/**
 * In-memory API harness for testing
 */
export class InmemoryApi {
  constructor() {
    this.app = null
    this.address = null
  }

  /**
   * Start test server on random port
   * @returns {Promise<void>}
   */
  async start() {
    const port = await getPort()
    this.app = await buildApp({ logger: false })

    await this.app.listen({ port, host: '127.0.0.1' })
    this.address = `http://127.0.0.1:${port}`
  }

  /**
   * Stop test server
   * @returns {Promise<void>}
   */
  async stop() {
    if (this.app) {
      await this.app.close()
    }
  }

  /**
   * Make request to test server
   * @param {string} path
   * @returns {Promise<Response>}
   */
  async request(path) {
    return fetch(`${this.address}${path}`)
  }

  /**
   * Get Fastify inject method for direct testing
   * @returns {import('fastify').FastifyInstance['inject']}
   */
  inject() {
    return this.app.inject.bind(this.app)
  }
}
```

### Unit Tests - `test/unit/someUnitTest.spec.js`

```javascript
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

describe('SomeService', () => {
  describe('calculateTotal', () => {
    it('should calculate total correctly', () => {
      // Arrange
      const items = [
        { price: 10, quantity: 2 },
        { price: 5, quantity: 3 },
      ]

      // Act
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

      // Assert
      assert.equal(total, 35, 'Total should be 35')
    })

    it('should handle empty array', () => {
      // Arrange
      const items = []

      // Act
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

      // Assert
      assert.equal(total, 0, 'Total should be 0 for empty array')
    })
  })
})
```

### Integration Tests - `test/int/someIntTest.spec.js`

```javascript
import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { InmemoryApi } from '../inmemoryApi.js'

describe('API Integration Tests', () => {
  const api = new InmemoryApi()

  before(async () => {
    await api.start()
  })

  after(async () => {
    await api.stop()
  })

  describe('GET /', () => {
    it('should return home page', async () => {
      // Act
      const response = await api.inject()({
        method: 'GET',
        url: '/',
      })

      // Assert
      assert.equal(response.statusCode, 200, 'Status should be 200')
      assert.ok(response.body.includes('<h1>'), 'Should contain heading')
    })
  })

  describe('GET /api/content', () => {
    it('should return content fragment', async () => {
      // Act
      const response = await api.inject()({
        method: 'GET',
        url: '/api/content',
      })

      // Assert
      assert.equal(response.statusCode, 200, 'Status should be 200')
      assert.ok(response.body.includes('<h3>'), 'Should contain fragment heading')
    })
  })

  describe('POST /api/submit', () => {
    it('should handle form submission', async () => {
      // Act
      const response = await api.inject()({
        method: 'POST',
        url: '/api/submit',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        payload: 'username=testuser',
      })

      // Assert
      assert.equal(response.statusCode, 200, 'Status should be 200')
    })

    it('should reject invalid submission', async () => {
      // Act
      const response = await api.inject()({
        method: 'POST',
        url: '/api/submit',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        payload: '',
      })

      // Assert
      assert.equal(response.statusCode, 400, 'Status should be 400')
    })
  })
})
```

### E2E Tests with Playwright

#### `test/browser.js` - Browser Wrapper

```javascript
import { chromium } from '@playwright/browser-chromium'

/**
 * Browser instance wrapper for Playwright
 */
export class Browser {
  constructor() {
    this.browser = null
    this.context = null
    this.page = null
  }

  /**
   * Launch browser
   * @param {object} options
   * @returns {Promise<void>}
   */
  async launch(options = {}) {
    this.browser = await chromium.launch({
      headless: options.headless ?? true,
    })
    this.context = await this.browser.newContext()
    this.page = await this.context.newPage()
  }

  /**
   * Navigate to URL
   * @param {string} url
   * @returns {Promise<void>}
   */
  async goto(url) {
    await this.page.goto(url)
  }

  /**
   * Close browser
   * @returns {Promise<void>}
   */
  async close() {
    if (this.browser) {
      await this.browser.close()
    }
  }

  /**
   * Get page instance
   * @returns {import('playwright').Page}
   */
  getPage() {
    return this.page
  }
}
```

#### `test/e2e/app.page.js` - Page Object

```javascript
/**
 * Page Object for main app page
 */
export class AppPage {
  /**
   * @param {import('playwright').Page} page
   */
  constructor(page) {
    this.page = page
  }

  /**
   * Navigate to home page
   * @param {string} baseUrl
   * @returns {Promise<void>}
   */
  async goto(baseUrl) {
    await this.page.goto(baseUrl)
  }

  /**
   * Get page title
   * @returns {Promise<string>}
   */
  async getTitle() {
    return this.page.title()
  }

  /**
   * Get heading text
   * @returns {Promise<string>}
   */
  async getHeading() {
    return this.page.locator('h1').textContent()
  }

  /**
   * Check if element is visible
   * @param {string} selector
   * @returns {Promise<boolean>}
   */
  async isVisible(selector) {
    return this.page.locator(selector).isVisible()
  }

  /**
   * Click element
   * @param {string} selector
   * @returns {Promise<void>}
   */
  async click(selector) {
    await this.page.locator(selector).click()
  }

  /**
   * Fill input field
   * @param {string} selector
   * @param {string} value
   * @returns {Promise<void>}
   */
  async fill(selector, value) {
    await this.page.locator(selector).fill(value)
  }

  /**
   * Wait for HTMX request to complete
   * @returns {Promise<void>}
   */
  async waitForHtmx() {
    await this.page.evaluate(() => {
      return new Promise((resolve) => {
        document.body.addEventListener('htmx:afterSwap', resolve, { once: true })
      })
    })
  }
}
```

#### `test/e2e/app.spec.js` - E2E Test

```javascript
import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { InmemoryApi } from '../inmemoryApi.js'
import { Browser } from '../browser.js'
import { AppPage } from './app.page.js'

describe('E2E: App Flow', () => {
  const api = new InmemoryApi()
  const browser = new Browser()
  let page

  before(async () => {
    // Start server
    await api.start()

    // Launch browser
    await browser.launch({ headless: true })
    page = new AppPage(browser.getPage())
  })

  after(async () => {
    await browser.close()
    await api.stop()
  })

  describe('Home Page', () => {
    it('should display home page correctly', async () => {
      // Navigate to home page
      await page.goto(api.address)

      // Verify page title
      const title = await page.getTitle()
      assert.equal(title, 'Home', 'Page title should be "Home"')

      // Verify heading
      const heading = await page.getHeading()
      assert.equal(heading, 'Welcome', 'Heading should be "Welcome"')
    })

    it('should load content dynamically with HTMX', async () => {
      // Navigate to home page
      await page.goto(api.address)

      // Click load button
      await page.click('[hx-get="/api/content"]')

      // Wait for HTMX to complete
      await page.waitForHtmx()

      // Verify content loaded
      const isVisible = await page.isVisible('h3')
      assert.ok(isVisible, 'Dynamic content should be visible')
    })
  })

  describe('Form Submission', () => {
    it('should submit form successfully', async () => {
      // Navigate to page with form
      await page.goto(api.address)

      // Fill form
      await page.fill('input[name="username"]', 'testuser')

      // Submit form
      await page.click('button[type="submit"]')

      // Wait for response
      await page.waitForHtmx()

      // Verify response
      const responseVisible = await page.isVisible('#response')
      assert.ok(responseVisible, 'Response should be visible')
    })
  })

  describe('Navigation with hx-boost', () => {
    it('should navigate without full page reload', async () => {
      // Navigate to home page
      await page.goto(api.address)

      // Click navigation link
      await page.click('a[href="/about"]')

      // Wait for HTMX navigation
      await page.waitForHtmx()

      // Verify URL changed
      const url = browser.getPage().url()
      assert.ok(url.includes('/about'), 'URL should include /about')
    })
  })
})
```

## Development Workflow

### Running the Development Server

```bash
# Install dependencies
pnpm install

# Start development server (port 8000)
pnpm dev

# Build for production
pnpm build

# Run production server
pnpm start
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test types
pnpm test:unit
pnpm test:int
pnpm test:e2e

# Run tests in watch mode
pnpm test -- --watch

# Use the test.js script for convenient test running with fuzzy search
pnpm test:file some-test                              # Fuzzy search
pnpm test:file packages/server/test/int/api.spec.js  # Specific file
pnpm test:file "packages/**/int/*.spec.js"            # Glob pattern
pnpm test:file releases "should create release"       # Filter by test name
COVERAGE=true pnpm test:file releases                 # With coverage
```

### Code Quality

```bash
# Run linter
pnpm lint

# Fix linting issues
pnpm lint -- --fix

# Format code
pnpm format

# Type check
pnpm typecheck
```

### Development Commands

```bash
# Clean build artifacts
rm -rf dist

# View Turborepo cache
turbo run build --dry-run

# Clear Turborepo cache
turbo daemon clean
```

## Best Practices

### Server-Side Rendering

- Always render initial HTML on the server
- Use HTMX for partial updates after initial load
- Keep JavaScript minimal and progressive

### Progressive Enhancement

- Site should work without JavaScript
- Use `hx-boost` for seamless navigation
- Add Alpine.js for interactive UI components

### Performance

- Bundle and minify CSS/JS for production
- Use CSS cascade layers to control specificity
- Lazy-load non-critical assets
- Leverage HTTP/2 for parallel asset loading

### Testing

- Test pure logic with unit tests
- Test API routes with integration tests
- Test user flows with E2E tests using Page Objects
- Use InmemoryApi for consistent test environments

### Code Organization

- Keep routes thin, move logic to services
- Use Fastify plugins for modularity
- Follow file naming conventions
- Co-locate page templates with routes

### Type Safety

- Write JSDoc comments for all functions
- Use `@param` and `@returns` annotations
- Run `tsc --noEmit` to catch type errors
- Define DTO types for API boundaries

### Handlebars Templates

- Use layouts for consistent page structure
- Register partials for reusable components
- Use fragments for HTMX partial responses
- Set `layout: false` for fragment responses

### HTMX Integration

- Use semantic HTML with HTMX attributes
- Handle loading states with `hx-indicator`
- Return minimal HTML fragments for efficiency
- Use SSE for real-time updates

### Alpine.js Integration

- Use for client-side state and interactivity
- Keep components small and focused
- Combine with HTMX for server-driven updates
- Use `x-data` for component initialization

## Summary

This stack provides a modern SSR approach with:

- **Fast development** with hot reload and watch mode
- **Type safety** via JSDoc and TypeScript checking
- **Progressive enhancement** with HTMX and Alpine.js
- **Comprehensive testing** with unit, integration, and E2E tests
- **Maintainable architecture** with clear patterns and conventions
- **Optimized performance** with minimal JavaScript and efficient bundling

The architecture prioritizes server-rendered HTML with lightweight client-side enhancements, providing excellent performance and accessibility while maintaining developer productivity.
