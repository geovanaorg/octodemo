# OctoCAT Supply Chain Management Application – General Copilot Instructions

These are repository-wide guidelines. Path‑scoped files in `.github/instructions/*.instructions.md` provide focused guidance for specific areas (frontend, API, database).

## High-Level Architecture

TypeScript monorepo with:
- `api/` Express REST API (SQLite persistence, repository pattern, Swagger docs)

- `frontend/` React + Vite + Tailwind UI
- Shared demo + infra docs under `docs/` and deployment scripts under `infra/`

Refer to `docs/architecture.md` and `docs/sqlite-integration.md` for deeper details. Avoid restating them in reviews and link instead.

## General Review Guidance
When generating suggestions:
1. Prefer incremental, minimal diffs; preserve existing style and naming.
2. Surface security, correctness, and data integrity issues before micro-optimizations.

3. Encourage type safety (no `any` unless justified). Suggest adding/refining model or DTO types when gaps appear.

4. Flag duplicate logic that belongs in a shared utility or repository method.
5. Ensure error handling uses existing custom error types where appropriate (e.g., NotFound, Validation, Conflict) and propagates consistent HTTP status codes via middleware.
6. Encourage tests: request unit tests for new repository logic and component tests (or at least React Testing Library coverage) for critical UI paths.
7. For performance concerns, highlight N+1 query patterns, unnecessary data loading, or large bundle additions.
8. Prefer environment variable driven configuration; avoid hard‑coded paths/secrets.

## Monorepo Workflow

- Build frequently: `npm run build --workspace=api` or `--workspace=frontend` (root build runs both)

- Keep PRs scoped: code + tests + docs (architecture or build notes) when behavior changes.
- Update related instruction files if new folders or architectural slices are introduced.

## Do Not Repeat
Do not inline full API route or component files in review feedback unless absolutely necessary: quote only the lines requiring change. Summarize low‑impact nits.

## Escalation Order for Suggestions
1. Security / data integrity
2. Logical / functional correctness
3. Performance / scalability
4. Maintainability / duplication
5. Readability / consistency
6. Style / minor formatting

## Tone & Feedback Style
Be concise, actionable, and cite a rationale ("because" clause) for non-trivial recommendations. Offer one preferred solution; optionally a lightweight alternative.

---

## Language-Specific Best Practices

### TypeScript (Backend & Frontend)

#### Type Safety
- **Avoid `any`**: Use specific types or `unknown` when type is uncertain. Justify any use of `any` with comments.
- **Enable strict mode**: Keep `strict: true` in tsconfig.json for maximum type safety.
- **Use interfaces for data models**: Define clear interfaces for all data structures (see `api/src/models/`).
- **Leverage type inference**: Let TypeScript infer simple return types; explicitly type complex functions and public APIs.
- **Use discriminated unions**: For state management and conditional logic with different data shapes.

#### Code Organization
- **Single Responsibility Principle**: Each module, class, or function should have one clear purpose.
- **Repository Pattern**: Follow existing pattern in `api/src/repositories/` for data access logic.
- **Separate concerns**: Keep business logic separate from route handlers; route handlers should orchestrate, not implement.
- **Use barrel exports**: Export related functionality from index files when appropriate.

#### Async/Await Patterns
- **Prefer async/await over promises**: More readable than `.then()` chains.
- **Handle errors properly**: Always wrap database operations in try-catch blocks.
- **Use custom error types**: Extend `DatabaseError`, `NotFoundError`, `ValidationError`, or `ConflictError` from `utils/errors.ts`.
- **Never swallow errors**: Always rethrow or handle appropriately with meaningful messages.

#### Naming Conventions
- **camelCase** for variables, functions, and methods
- **PascalCase** for classes, interfaces, types, and React components
- **SCREAMING_SNAKE_CASE** for constants
- **Prefix interfaces with 'I' only when necessary** (e.g., to distinguish from class implementations)
- **Use descriptive names**: `getUserById` not `getUser`, `isLoading` not `loading`

#### Functions
- **Keep functions small**: Aim for functions under 50 lines; extract sub-functions when needed.
- **Pure functions when possible**: Functions should have no side effects and return consistent results.
- **Explicit return types for exported functions**: Helps with API documentation and refactoring.
- **Use arrow functions for callbacks**: Consistent with modern JavaScript style.

### React/TSX (Frontend)

#### Component Structure
- **Functional components with hooks**: Use React hooks (useState, useEffect, useContext) over class components.
- **One component per file**: Makes code easier to navigate and test.
- **Props interface**: Define types for all component props at the top of the file.
- **Use destructuring**: Destructure props in function signature for clarity.

#### State Management
- **useState for local state**: Simple component-specific state.
- **useContext for shared state**: Auth, theme, and other cross-cutting concerns (see `context/`).
- **Custom hooks**: Extract reusable stateful logic into custom hooks (e.g., `useAuth`, `useTheme`).
- **Avoid prop drilling**: Use context or state management libraries for deeply nested data needs.

#### Context API Pattern
- **Create typed contexts**: Define context type interface and use createContext with proper typing.
- **Provider components**: Create dedicated Provider components that wrap context values.
- **Custom hooks for context**: Export custom hooks (e.g., `useAuth`, `useTheme`) instead of exposing context directly.
- **Context validation**: Throw meaningful errors if context is used outside of provider.
- **Separate context files**: Keep each context in its own file in `context/` directory.
- **Initialize with null**: Use `createContext<Type | null>(null)` pattern for safe initialization.

#### Performance
- **useMemo for expensive calculations**: Only when profiling shows need.
- **useCallback for function props**: When passing callbacks to optimized ch
- **Conditional classes**: Use template literals for dynamic class composition based on state.
- **Transition classes**: Apply transition-colors or transition-all for smooth theme/state changes.

#### PostCSS & Tailwind Configuration
- **Extend theme**: Use `theme.extend` in tailwind.config.js for custom colors, spacing, etc.
- **Custom colors**: Define semantic color names (primary, accent, dark, light) for consistency.
- **Dark mode class strategy**: Set `darkMode: 'class'` for manual dark mode control.
- **Content paths**: Ensure all component paths are included in content array for proper purging.
- **Keep config minimal**: Only customize what's necessary; leverage Tailwind defaults.ild components.
- **React.lazy for code splitting**: Split large components or routes for better initial load.
- **Key props in lists**: Always provide stable, unique keys for list items.

#### Styling with Tailwind
- **Use Tailwind utility classes**: Prefer utilities over custom CSS.
- **Dark mode support**: Use `darkMode ? 'class-dark' : 'class-light'` pattern as seen in Navigation.tsx.
- **Extract repeated patterns**: Create reusable components for common UI patterns.
- **Responsive design**: Use Tailwind's responsive prefixes (sm:, md:, lg:).

#### Accessibility
- **Semantic HTML**: Use appropriate HTML elements (nav, main, article, etc.).
- **ARIA labels**: Add aria-label where text content isn't visible.
- **Keyboard navigation**: Ensure all interactive elements are keyboard accessible.
- **Alt text**: Always provide meaningful alt text for images.

### SQL (Database)

#### Schema Design
- **Use INTEGER PRIMARY KEY**: Take advantage of SQLite's rowid optimization.
- **Define FOREIGN KEY constraints**: Ensure referential integrity with ON DELETE CASCADE where appropriate.
- **NOT NULL constraints**: Be explicit about required fields.
- **Use meaningful names**: `supplier_id` not `sid`, use snake_case for SQL identifiers.

#### Migrations
- **Sequential numbering**: Follow `001_`, `002_` pattern for migration files.
- **One purpose per migration**: Each migration should have a single, clear objective.
- **Include rollback strategy**: Document how to reverse migrations in comments.
- **Test migrations**: Verify migrations work on empty and populated databases.

#### Queries
- **Parameterized queries**: Always use prepared statements to prevent SQL injection.
- **Select specific columns**: Avoid `SELECT *` in production code; specify columns needed.
- **Use indexes**: Create indexes on frequently queried columns (especially foreign keys).
- **Avoid N+1 queries**: Use JOINs or batch operations instead of iterating with individual queries.

#### Data Integrity
- **Validate before insert**: Check data validity in application layer before database operations.
- **Use transactions**: For operations affecting multiple tables or requiring atomicity.
- **Handle constraint violations**: Map SQLite errors to meaningful application errors.

#### SQL Utility Functions
- **buildInsertSQL**: Use utility to generate parameterized INSERT statements from objects.
- **buildUpdateSQL**: Use utility to generate parameterized UPDATE statements from partial objects.
- **objectToCamelCase**: Convert snake_case database rows to camelCase JavaScript objects.
- **mapDatabaseRows**: Batch convert multiple rows from snake_case to camelCase.
- **Type conversions**: Handle SQLite integer-as-boolean conversions in repository layer.

### JavaScript (Configuration Files)

#### ES Modules
- **Use ES6 modules**: `import/export` over `require/module.exports` in modern projects.
- **Named exports**: Prefer named exports for better refactoring and tree-shaking.
- **Default exports**: Use for main module functionality or single component exports.

#### Configuration Files
- **Keep config minimal**: Only include necessary customization; rely on defaults.
- **Document non-obvious settings**: Add comments explaining why custom config is needed.
- **Environment-specific config**: Use environment variables for values that change between environments.
- **Separate concerns**: Keep ESLint, Prettier, Tailwind, and build configs in their own files.

### ESLint Configuration

#### Modern ESLint (Flat Config)
- **Use defineConfig**: Import and use `defineConfig` from eslint/config for type safety.
- **Flat config structure**: Use array of config objects instead of legacy .eslintrc format.
- **Global ignores**: Place ignore patterns in separate config object at the start.
- **Extend configs**: Use `extends` array with recommended configs (js.configs.recommended, tseslint.configs.recommended).

#### TypeScript Integration
- **typescript-eslint**: Use typescript-eslint plugin for TypeScript-specific rules.
- **Strict configs**: Include both recommended and strict TypeScript configs for maximum safety.
- **Disable redundant rules**: Turn off 'no-unused-vars' in favor of '@typescript-eslint/no-unused-vars'.
- **Ignore pattern for unused**: Use `argsIgnorePattern: '^_'` and `varsIgnorePattern: '^_'` to allow underscore-prefixed unused variables.

#### API-Specific Rules
- **Allow console warnings**: Don't enforce 'no-console' in backend code; logging is expected.
- **Relax explicit return types**: Set '@typescript-eslint/explicit-function-return-type': 'off' for cleaner code.
- **Warn on any**: Use 'warn' instead of 'error' for '@typescript-eslint/no-explicit-any' to allow pragmatic usage.
- **Prefer modern JS**: Enforce 'no-var', 'prefer-const', 'prefer-template'.

#### Frontend-Specific Rules
- **React Hooks**: Include 'eslint-plugin-react-hooks' with recommended rules.
- **React Refresh**: Use 'eslint-plugin-react-refresh' for HMR compatibility.
- **Browser globals**: Set `globals.browser` for browser APIs.
- **Curly braces**: Enforce `curly: ['error', 'all']` for consistent block statements.

#### Test Files
- **Separate test config**: Create specific config object for test files (*.test.ts, *.spec.ts).
- **Test globals**: Include jest/vitest globals for test environment.
- **Relaxed rules for tests**: Allow console.log and any types in test files for easier mocking.

### Shell Scripts (Bash)

#### Script Structure
- **Shebang line**: Start with `#!/usr/bin/env bash` for portability.
- **Set error handling**: Use `set -e` to exit on error, `set -u` for undefined variable errors.
- **Document script purpose**: Add comments explaining what the script does.
- **Check prerequisites**: Verify required tools/files exist before running commands.

#### Best Practices
- **Validate input**: Check for required arguments and provide helpful error messages.
- **Quote variables**: Use `"${variable}"` to handle spaces and special characters safely.
- **Use meaningful variable names**: Lowercase with underscores (e.g., `feature_name`, not `fn`).
- **Provide feedback**: Echo status messages so users know what's happening.
- **Exit codes**: Return 0 for success, non-zero for errors.

#### Portability
- **Avoid bashisms in sh**: If using `#!/bin/sh`, stick to POSIX-compatible syntax.
- **Check command availability**: Use `command -v` to verify tools exist before use.
- **Handle paths carefully**: Use `$PWD` or `$(dirname "${BASH_SOURCE[0]}")` for reliable path resolution.

### JSON (Configuration & Data)

#### Structure
- **Consistent formatting**: Use 2-space indentation (matches project prettier/editor config).
- **Alphabetize when possible**: Makes finding keys easier in large JSON files.
- **Use meaningful keys**: Descriptive, not abbreviated (e.g., `dependencies` not `deps`).

#### Package.json
- **Semantic versioning**: Follow semver for version numbers.
- **Lock exact versions carefully**: Use caret (^) for flexibility, exact versions for critical dependencies.
- **Organize scripts logically**: Group related scripts (build, dev, test, db operations).
- **Document custom scripts**: Add comments or README sections explaining non-obvious scripts.

### Swagger/OpenAPI

#### Documentation
- **Document all endpoints**: Every route should have Swagger annotations.
- **Include examples**: Provide example request/response bodies for complex operations.
- **Specify error responses**: Document all possible HTTP status codes and error formats.
- **Use models**: Define reusable schemas for request/response objects.
- **Keep in sync**: Update Swagger docs when changing API contracts.

### Testing

#### General Principles
- **Write tests for new features**: All new functionality should include tests.
- **Test happy and error paths**: Cover both successful operations and error scenarios.
- **Use descriptive test names**: Test names should clearly describe what's being tested.
- **Arrange-Act-Assert**: Structure tests with clear setup, action, and verification phases.

#### Unit Tests (Vitest)
- **Test repository methods**: Verify data access logic with various inputs.
- **Mock external dependencies**: Use Vitest's mocking for database and external services.
- **Test edge cases**: Null values, empty arrays, boundary conditions.
- **Aim for high coverage**: Target 80%+ coverage for critical business logic.

#### Vitest Configuration
- **Reference types**: Add `/// <reference types="vitest" />` at top of config file.
- **Set environment**: Use `environment: 'node'` for API tests, 'jsdom' for frontend tests.
- **Disable globals**: Set `globals: false` to avoid global test functions; import explicitly.
- **Coverage reporters**: Include 'text', 'json', 'json-summary', 'html' for comprehensive coverage reporting.
- **Exclude patterns**: Exclude dist, node_modules, and non-source directories from test runs.
- **Config file location**: Place vitest.config.ts at workspace root for each package.

#### Component Tests (React Testing Library)
- **Test user interactions**: Click, type, submit events.
- **Test rendered output**: Verify correct elements appear based on state/props.
- **Avoid implementation details**: Test behavior, not internal state or structure.
- **Use semantic queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`.

#### E2E Tests (Playwright)
- **Test critical user flows**: Authentication, CRUD operations, navigation.
- **Test across browsers**: Leverage Playwright's multi-browser support.
- **Use page object pattern**: Encapsulate page interactions in reusable classes/functions.
- **Keep tests independent**: Each test should be runnable in isolation.

### Makefile

#### Structure
- **Use .PHONY targets**: Declare all non-file targets as .PHONY to avoid conflicts with files of the same name.
- **Provide help target**: Include a `help` target as default that lists all available targets with descriptions.
- **Group related targets**: Organize targets logically with `##@` section headers (e.g., ##@ Installation, ##@ Development).
- **Use target descriptions**: Add `## Description` after target name for auto-generated help documentation.

#### Variables
- **Allow environment overrides**: Use `?=` for variables that can be overridden (e.g., `BACKEND ?= nodejs`).
- **Detect project structure**: Use shell commands to auto-detect backend type, API directory, etc.
- **Define common paths**: Store frequently used paths in variables (API_DIR, FRONTEND_DIR).
- **Use := for immediate expansion**: When variable value won't change, use `:=` for efficiency.

#### Targets
- **Keep commands portable**: Test on both Linux/macOS and consider Windows compatibility.
- **Echo informative messages**: Let users know what's happening (`@echo "Starting development..."`).
- **Handle errors gracefully**: Use `@exit 1` for unrecoverable errors with clear error messages.
- **Chain dependent tasks**: Use `&&` to ensure sequential execution or dependencies between targets.
- **Background processes**: Use `trap 'kill 0' INT` pattern when running multiple processes concurrently.

#### Best Practices
- **Conditional logic**: Use `ifeq/else/endif` for backend-specific or environment-specific commands.
- **Avoid hardcoding**: Parameterize everything that might change (ports, directories, commands).
- **Document decisions**: Add comments explaining non-obvious logic or project-specific choices.
- **Test across backends**: Ensure targets work with all supported backend options (nodejs, python).

### Docker & Containerization

#### Dockerfile Structure
- **Use multi-stage builds**: Separate build and runtime stages to minimize final image size.
- **Specific base images**: Use specific tags (e.g., `node:24-alpine`) instead of `latest` for reproducibility.
- **Leverage build cache**: Order commands from least to most frequently changed (dependencies before source).
- **Copy package files first**: Copy `package*.json` before source code to cache dependency installation.

#### Best Practices
- **Minimize layers**: Combine related RUN commands with `&&` to reduce layer count.
- **Use .dockerignore**: Exclude node_modules, dist, .git, and other unnecessary files.
- **Run as non-root**: Use USER directive or run with nginx user for security.
- **Set proper permissions**: Explicitly set file permissions with `chmod` and `chown`.
- **Use COPY over ADD**: Unless you need ADD's special features (tar extraction, URLs).
- **Set working directory**: Always use WORKDIR instead of `cd` commands.

#### Environment Variables
- **Provide defaults**: Use ENV to set default values that can be overridden at runtime.
- **Document required vars**: Comment which environment variables are required vs optional.
- **Validate at runtime**: Check critical environment variables in entrypoint scripts.

#### Node.js Containers
- **Install production deps only**: Use `npm install --omit=dev` in runtime stage.
- **Copy build artifacts**: Copy compiled `dist/` from builder stage, not source files.
- **Include necessary files**: Don't forget database migrations, public assets, or config files.

#### Nginx Containers
- **Custom configuration**: Copy custom nginx.conf to override defaults.
- **Use entrypoint scripts**: For runtime configuration substitution (e.g., API_HOST, API_PORT).
- **Expose correct ports**: Match EXPOSE directive with actual service port.
- **Serve built assets**: Copy built frontend from builder stage to nginx html directory.

### Docker Compose

#### Service Definition
- **Use version 3.8+**: For modern compose features and syntax.
- **Build context**: Set context to service directory (e.g., `./api`, `./frontend`).
- **Port mapping**: Map container ports to host (format: `"host:container"`).
- **Service dependencies**: Use `depends_on` to control startup order.

#### Environment Variables
- **Use env vars**: Set environment variables for configuration (NODE_ENV, API_HOST).
- **Avoid hardcoding**: Make configuration injectable, not baked into images.
- **Use .env files**: For local development, create .env file for environment-specific values.

#### Networking
- **Implicit networks**: Services on same compose file can reference each other by service name.
- **DNS resolution**: Use service name as hostname (e.g., `api:3000` from frontend service).

### Azure Bicep (Infrastructure as Code)

#### Resource Naming
- **Use parameters**: Externalize names, locations, and configurations as parameters.
- **Create naming variables**: Compute resource names from parameters to ensure consistency.
- **Handle length limits**: Azure resources have name length limits; truncate or abbreviate carefully.
- **Clean names**: Remove invalid characters, replace underscores with hyphens for Azure compatibility.
- **Use prefixes/suffixes**: Add resource type suffixes (`-ca` for Container App, `-frt` for frontend).

#### Parameters
- **Provide descriptions**: Use @description decorator for all parameters.
- **Set defaults**: Provide sensible defaults (e.g., `resourceGroup().location` for location).
- **Use @secure**: Mark sensitive parameters (passwords, secrets) with @secure decorator.
- **Type parameters**: Specify parameter types (string, int, bool, array, object).

#### Resource Definitions
- **Use latest stable API versions**: Reference recent, stable API versions (check Azure docs).
- **Tag resources**: Add tags for environment, project, or demo instance identification.
- **Set resource dependencies**: Bicep infers dependencies from resource references; use `dependsOn` only when needed.
- **Configure ingress**: Set external: true, targetPort, and allowInsecure: false for public services.

#### Best Practices
- **Modularize**: Break large templates into modules for reusability.
- **Use variables**: Calculate derived values in variables section, not inline.
- **Output important values**: Output URLs, IDs, or connection strings for use in deployment scripts.
- **Test deployments**: Validate with `az bicep build` before deploying.

### Vite (Frontend Build Tool)

#### Configuration
- **Define server options**: Set port, host (0.0.0.0 for containers), and strictPort: true.
- **Host binding**: Use `host: '0.0.0.0'` to allow external connections (Codespaces, containers).
- **Define environment variables**: Use `define` to inject environment variables (process.env.CODESPACE_NAME).
- **Plugin configuration**: Load plugins at top level (e.g., @vitejs/plugin-react).

#### Development
- **Hot Module Replacement**: Vite enables HMR by default; use it for fast development.
- **Port consistency**: Use consistent dev server port across team (e.g., 5137).
- **Proxy API requests**: Use server.proxy if API and frontend run on different ports locally.

#### Build Optimization
- **Code splitting**: Vite automatically code-splits; use dynamic imports for route-based splitting.
- **Asset optimization**: Vite optimizes images, fonts, and static assets automatically.
- **Tree shaking**: Ensure imports are ESM-style for effective tree-shaking.

#### Environment Variables
- **Use VITE_ prefix**: Only variables prefixed with VITE_ are exposed to client code.
- **Runtime configuration**: For containerized apps, inject config at runtime (see `public/runtime-config.js`).

### Express.js & API Patterns

#### Middleware
- **Order matters**: Register middleware in correct order: CORS → body parsers → routes → error handler.
- **Use express.json()**: For parsing JSON request bodies.
- **CORS configuration**: Configure CORS early in middleware chain with specific origins, methods, and headers.
- **Error handling middleware**: Register error handler as last middleware with 4 parameters `(err, req, res, next)`.

#### Route Handlers
- **Keep handlers thin**: Delegate business logic to services or repositories; handlers should orchestrate only.
- **Use async/await**: Always use async route handlers for database operations.
- **Handle errors consistently**: Wrap async code in try-catch; throw custom error types.
- **Validate input**: Check request parameters, query strings, and body before processing.

#### Error Propagation
- **Throw, don't catch-and-ignore**: Let errors propagate to error-handling middleware.
- **Use custom error classes**: Extend DatabaseError, NotFoundError, ValidationError, ConflictError.
- **Set status codes**: Error classes should include appropriate HTTP status codes.
- **Centralized error handling**: Use errorHandler middleware to format all error responses consistently.

#### Repository Pattern
- **One repository per entity**: Each data model should have a dedicated repository class (e.g., SuppliersRepository).
- **Inject database connection**: Pass database connection to repository constructor.
- **Return domain models**: Map database rows (snake_case) to domain models (camelCase).
- **Handle SQLite specifics**: Convert integer fields to booleans where appropriate for SQLite.
- **Methods return Promises**: All repository methods should be async and return Promises.

#### API Documentation
- **Swagger annotations**: Add JSDoc-style Swagger annotations to all routes.
- **Serve Swagger UI**: Expose `/api-docs` endpoint for interactive API documentation.
- **Expose OpenAPI spec**: Serve `/api-docs.json` for programmatic access to API schema.

### Better-SQLite3 (Database Library)

#### Database Connection
- **Wrap better-sqlite3**: Create abstraction layer (see `db/sqlite.ts`) for promise-based API.
- **Use Promise-based API**: Wrap sync methods (all(), get(), run()) in Promises for consistency.
- **Single connection**: Use singleton pattern; SQLite performs best with single connection in Node.js.
- **Enable foreign keys**: Add `PRAGMA foreign_keys = ON` immediately after opening connection.

#### Query Execution
- **Parameterized queries**: Always use positional (?) or named (:name) parameters, never string interpolation.
- **Handle results**: Use `all()` for multiple rows, `get()` for single row, `run()` for mutations.
- **Access lastID**: After INSERT, access `result.lastID` for auto-generated primary key.
- **Check affected rows**: After UPDATE/DELETE, check `result.changes` to verify operation succeeded.

#### Transactions
- **Use transactions**: Wrap multi-statement operations in BEGIN/COMMIT transactions.
- **Handle rollback**: Implement ROLLBACK on errors for atomicity.
- **Explicit is better**: Don't rely on implicit transactions; be explicit with BEGIN TRANSACTION.

#### Error Handling
- **Catch SQLite errors**: Map SQLITE_CONSTRAINT, SQLITE_BUSY to application-specific errors.
- **Check error codes**: Use error.code to distinguish constraint violations from other errors.
- **Provide context**: Include entity type and ID in error messages for better diagnostics.

### Error Handling & Custom Errors

#### Custom Error Classes
- **Extend base Error**: Create custom error classes extending built-in Error.
- **Include status codes**: Add statusCode property for HTTP response mapping.
- **Add error codes**: Include machine-readable error code (e.g., 'NOT_FOUND', 'VALIDATION_ERROR').
- **Set error name**: Override name property to match class name.

#### Error Hierarchy
- **Base DatabaseError**: Create base class for all database-related errors.
- **Specific error types**: Extend base for NotFoundError (404), ValidationError (400), ConflictError (409).
- **Constructor consistency**: Accept message and automatically set code/statusCode.

#### Error Handler Middleware
- **Four parameter signature**: Express recognizes error middleware by 4-param signature: `(err, req, res, next)`.
- **Check error type**: Use `instanceof` to determine if error is a known custom type.
- **Format responses**: Return consistent JSON structure: `{ error: { code, message } }`.
- **Log errors**: Log full error details for debugging, but return safe messages to clients.
- **Catch-all**: Handle unknown errors with generic 500 response.

#### Usage Pattern
- **Throw typed errors**: Throw specific error types (NotFoundError, ValidationError) in application code.
- **Use handleDatabaseError**: Utility function to map SQLite errors to application errors.
- **Never swallow errors**: Always propagate errors; only catch to add context or convert types.

### Environment Variables & Configuration

#### Server Configuration
- **PORT**: Use process.env.PORT with fallback (e.g., `process.env.PORT || 3000`).
- **NODE_ENV**: Check for 'production', 'development', 'test' to adjust behavior.
- **API_CORS_ORIGINS**: Parse comma-separated allowed origins; include regex patterns for dynamic domains.

#### Frontend Configuration
- **VITE_API_URL**: API base URL (only VITE_ prefixed vars are exposed to client).
- **Runtime injection**: For containers, inject config via entrypoint script modifying runtime-config.js.
- **API_HOST and API_PORT**: Container environment variables used by entrypoint to configure API URL.

#### Build-time vs Runtime
- **Build-time**: Vite variables (VITE_ prefix) baked into bundle at build time.
- **Runtime**: Script tag in index.html loading runtime-config.js allows post-build configuration.
- **Choose wisely**: Use runtime config for deployment-specific values (API URLs), build-time for static config.

### CORS & Security

#### CORS Configuration
- **Explicit origins**: List allowed origins explicitly; avoid wildcard (`*`) in production.
- **Support regex patterns**: Use regex for dynamic subdomains (Codespaces, Azure Container Apps).
- **Parse from environment**: Allow CORS origins to be configured via API_CORS_ORIGINS environment variable.
- **Specify methods**: Explicitly list allowed HTTP methods (GET, POST, PUT, DELETE, OPTIONS).
- **Allow headers**: Whitelist headers needed by frontend (Content-Type, Authorization).
- **Credentials support**: Enable credentials: true if using cookies or auth headers.

#### Security Headers
- **Set appropriate status codes**: Return correct HTTP status for each error type.
- **Validate input**: Check all user input before processing; return 400 for invalid input.
- **Sanitize errors**: Don't expose sensitive information (stack traces, DB details) to clients.

### Module Systems (ESM vs CommonJS)

#### API (CommonJS)
- **tsconfig target**: Set `"module": "commonjs"` in api/tsconfig.json.
- **File extensions**: Compiled JS uses .js extension; no need for .mjs.
- **Imports in TS**: Use ESM-style imports (`import/export`) in TypeScript; TypeScript compiles to CommonJS.

#### Frontend (ESM)
- **package.json type**: Set `"type": "module"` in frontend/package.json for native ESM.
- **File extensions**: Use .js for JavaScript, .ts/.tsx for TypeScript.
- **Vite uses ESM**: Vite requires ESM; use import/export syntax throughout.

#### Configuration Files
- **ESLint (.mjs)**: Use .mjs extension and ESM syntax for ESLint config.
- **Vite (.ts)**: Use TypeScript ESM syntax for vite.config.ts.
- **Tailwind (.js)**: Use CommonJS or ESM depending on project setup; follow existing pattern.

#### Best Practices
- **Be consistent**: Don't mix module systems within a workspace.
- **Use .mjs when needed**: If CommonJS project needs ESM config file, use .mjs extension.
- **Check package.json**: Respect "type" field; defaults to CommonJS if not specified.

### Nginx (Web Server for Frontend)

#### Configuration
- **Custom conf file**: Override default nginx.conf by copying to `/etc/nginx/conf.d/default.conf`.
- **SPA routing**: Configure `try_files $uri /index.html` for client-side routing fallback.
- **API proxying**: Use `proxy_pass` to proxy API requests if frontend and API share a domain.
- **Gzip compression**: Enable gzip for text assets (HTML, CSS, JS, JSON).

#### Security
- **Disable server tokens**: `server_tokens off;` to hide Nginx version.
- **Set headers**: Add security headers (X-Content-Type-Options, X-Frame-Options).
- **HTTPS**: Prefer HTTPS; redirect HTTP to HTTPS in production.

#### Performance
- **Static file serving**: Use `location /` block for serving built assets.
- **Cache headers**: Set appropriate cache headers for static assets vs index.html.
- **Compression**: Enable gzip for CSS, JS, JSON, SVG files.

#### Docker Integration
- **Use alpine image**: `nginx:alpine` for smaller image size.
- **Copy built assets**: Copy from builder stage to `/usr/share/nginx/html/`.
- **Custom entrypoint**: Use entrypoint script for runtime environment variable substitution.
- **Run as nginx user**: Ensure proper permissions and run container as non-root.

---
If new subsystems are added (e.g., `mobile/`, `worker/`), create a new `*.instructions.md` with `applyTo` globs instead of bloating this file.
