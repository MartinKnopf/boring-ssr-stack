# Server

This app is running as a lambda behind an API Gateway. It could also run on a server.

## Structure

```
api/
│   index.js                // The AWS Lambda function (wraps the server with fastify-aws-lambda)
│   ...
│
└───src/
│   │   app.js              // Creates the fastify app without starting it (used by server.js and in unit tests)
│   │   server.js           // Starts the fastify app for use in dev or exports the fastify app for use in cloud
│   │   ...
│   │
│   └───frontend/           // HTTP route handlers
│   │   │   css/            // Global CSS styles
│   │   │       style.css   // Main CSS file importing all other CSS files
│   │   │   components/     // Resuable Handlebars components
│   │   │   fragments/      // Reusable HTML fragments loaded with HTMX
│   │   │   modules/        // Reusable JavaScript front end modules
│   │   │   pages/
│   │   │   │   dashboard/  // Handles /frontend/dashboards requests
│   │   │   │   index/      // Handles /frontend/index requests
│   │   │   │   ...
│   │   │   services/       // Front end services
│   │   │   scripts/        // Helper scripts
│   │   │   layout.html     // Base HTML layout for Handlebars
│   │   │   main.js         // Main frontend JS entry point importing all page modules
│   │
│   └───api                 // REST route handlers
│   │   │   routes/
│   │   │   │   analytics/  // Handles /api/analytics requests
│   │   │   │   ...
```

## Test

- run all tests: `pnpm test` (will use `.env.development`)
- run all unit tests: `pnpm test-unit` (will use `.env.development`)
- run all integration tests: `pnpm test-int` (will use `.env.development`)
- run integration tests against the staging environment: `pnpm test-int-staging` (will use `.env.staging`)
- run specific int test file: `pnpm test-file apps/api/test/int/<spec>` (will use `.env.development`)
- run a specific int test from a specific file: `pnpm test-file apps/api/test/int/<spec> "<test title>"` (will use `.env.development`)
- run all e2e tests: `pnpm test-e2e` (will use `.env.development`)
- run e2e tests against the staging environment: `pnpm test-e2e-staging` (will use `.env.staging`)
- run specific e2e test file: `pnpm test-file apps/api/test/e2e/<spec>` (will use `.env.development`)
- run a specific e2e test from a specific file: `pnpm test-file apps/api/test/e2e/<spec> "<test title>"` (will use `.env.development`)
- test with specific log level: `LOG_LEVEL=error pnpm test-int`
- view browser during e2e tests: `HEADLESS=false pnpm test-e2e`

## Architecture

This API uses Fastify as the web framework for server-side rendering with Handlebars templates. It connects to a MongoDB database using Mongoose, with an in-memory instance for development and testing. The server includes an embedded front end in `src/frontend`. The front end is structured around pages, each with its own routes, templates, styles, and services. Further modularization of the front end is achieved through the following concepts: Components, fragments and modules.

The API also supports REST routes in `src/routes`.

The Fastify app is created in `src/app.js` and started locally in `src/server.js`. For AWS Lambda deployment, the app is wrapped using `fastify-aws-lambda` in `src/index.js` which is the Lambda entry point.

### Structure of a Page

- Pages are templates rendered with a laylout (e.g. `src/frontend/layout.html`)
- Pages correspond to a front end route (e.g. `/frontend/dashboards` for dashboards page)
- Pages can contain page-specific components, fragments, modules and styles
- A page module has to be imported in `src/frontend/main.js` to be bundled during build
- The page css file has to be imported by `src/frontend/styles/style.css` to be included in the final bundle

```bash
src/frontend/pages/
  ├── index/                   # Page folder
  │   ├── index.plugin.js      # Fastify plugin to initialize and register routes and services, has to be imported by app.js
  │   ├── index.route.js       # Route definitions which use service
  │   ├── index.service.js     # Business logic and data fetching, provides view models to the page
  │   ├── index.page.html      # Handlebars template for the page, uses components
  │   ├── index.page.css       # CSS specific to this page, imported by style.css
  │   ├── index.module.js      # Main module for this page, bundled during build (rollup.config.js), imported by the page
  │   ├── index.component.html # Page-specific component (used only by the page)
  │   ├── index.fragment.html  # Page-specific fragment, used only in the page, fetched with HTMX
```

### Structure of a Component

- Components are reusable Handlebars partials

```bash
src/frontend/components/
  ├── header/                   # Component folder
  │   ├── header.component.html # Component-specific Handlebars partial
  │   ├── header.component.css  # Component-specific css, has to be imported by style.css
```

### Structure of a Fragment

- Fragments are reusable HTML snippets that can be loaded dynamically via HTMX
- They have their own routes and services for server-side rendering
- Fragment routes must respond HTML

```bash
src/frontend/fragments/
  ├── footer/                  # Fragment folder
  │   ├── footer.plugin.ts     # Fastify plugin to initialize and register routes and services, has to be imported by App.ts
  │   ├── footer.route.ts      # Route definitions which might use services
  │   ├── footer.fragment.html # Fragment-specific Handlebars template, used in pages, components, other fragments, fetched with HTMX
  │   ├── footer.css           # Fragment-specific css, has to be imported by style.css
```

### Structure of a Module

- Modules are reusable front end JavaScript ES modules, that can be used by pages, components, and fragments
- They can have their own routes and services for server-side logic (REST)
- The get bundled with the main module
- If a module contains Alpine data components, they have to be created in a function, that has to be exported as default export and called in the main module before Alpine is started

```bash
src/frontend/modules/
  ├── userState/              # Module folder
  │   ├── userState.plugin.ts # Fastify plugin to initialize and register routes and services, has to be imported by App.ts
  │   ├── userState.route.ts  # Route definitions which might use services
  │   ├── userState.module.ts # ES module, usually imported by page modules
```
