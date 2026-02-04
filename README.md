# boring-ssr-stack

A boilerplate monorepo for server-side rendering with Fastify, Handlebars, HTMX, and Alpine.js.

## Stack Overview

**Runtime & Package Management**

- Node.js 20+
- pnpm (package manager)
- Turborepo (monorepo orchestration)

**Server**

- Fastify 5 (web framework)
- Handlebars (server-side templating)

**Frontend Interactivity**

- HTMX (declarative partial updates, `hx-boost`, SSE)
- Alpine.js (client-side reactivity and state)

**Styling**

- Pico CSS (classless semantic base)
- Tailwind CSS v4 (utility classes, no Preflight)

**Testing**

- Node.js built-in test runner (`node:test`)
- Unit, integration, and E2E tests (Playwright)

## Project Structure

```
boring-ssr-stack/
├── packages/
│   ├── server/                   # Fastify SSR application
│   │   ├── src/
│   │   │   ├── api/              # Route plugins and handlers
│   │   │   ├── frontend/         # Templates, CSS, and client JS
│   │   │   ├── app.js            # Fastify app factory
│   │   │   └── server.js         # Server entry point
│   │   ├── test/                 # Unit, integration, and E2E tests
│   │   └── package.json
│   └── shared/
│       ├── logger/               # Shared Pino logger
│       └── env/                  # Shared environment config loader
├── scripts/
│   └── test.js                   # Convenient test runner with fuzzy search
├── doc/
│   └── ssr-stack.md              # Full stack reference documentation
├── turbo.json                    # Turborepo configuration
├── pnpm-workspace.yaml           # pnpm workspace configuration
├── tsconfig.json                 # TypeScript config (JSDoc type checking)
├── eslint.config.mjs             # ESLint configuration
├── .prettierrc.json              # Prettier configuration
└── package.json                  # Root package with workspace scripts
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server (port 8000)
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Run linting and type checking
pnpm check
```

## Documentation

For comprehensive documentation on the SSR stack architecture, patterns, and best practices, see [doc/ssr-stack.md](doc/ssr-stack.md).
