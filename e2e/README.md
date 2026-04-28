# E2E Test Infrastructure

Playwright-based end-to-end tests for auth-test-app, designed as an **exportable library** so external projects (e.g., a browser extension) can reuse selectors, page objects, and fixtures.

## Quick Start

```bash
bun add -d @playwright/test   # already installed
bunx playwright install        # download browser binaries
bun run test:e2e               # run all specs
```

The test runner auto-starts the dev server if localhost:3000 isn't already running.

## Architecture

Four layers, each importable independently:

### Layer 1: Selectors (`e2e/selectors/`)

Pure CSS selector string constants. Zero dependencies — usable with Playwright, Puppeteer, Cypress, or raw DOM queries.

```ts
import { LOGIN } from './e2e/selectors/login';
console.log(LOGIN.USERNAME); // '#username'
console.log(LOGIN.FORM);     // 'form[action="/auth/login"]'
```

One file per page: `login.ts`, `register.ts`, `multi-step-login.ts`, `change-password.ts`, `mfa-verify.ts`, `dashboard.ts`, `passkey-conditional.ts`. Shared component selectors (alerts, password toggles, combo buttons) in `shared.ts`.

### Layer 2: Page Objects (`e2e/pages/`)

Functional objects with async methods that take a Playwright `Page`. Not classes — simpler to compose and tree-shake.

```ts
import { loginPage } from './e2e/pages/login';

await loginPage.goto(page);
await loginPage.fillAndSubmit(page, 'alice', 'password123');
await loginPage.expectRedirectToDashboard(page);
```

Methods follow a pattern: `goto`, `fill*`, `submit`, `expectError(page, msg?)`, `expectSuccess(page)`, `expectRedirectTo*(page)`.

### Layer 3: Fixtures (`e2e/fixtures/`)

**Admin API helpers** (`admin-api.ts`): Wraps the `/admin/*` REST endpoints for test setup/teardown — no UI interaction needed.

| Method | Endpoint | Returns |
|--------|----------|---------|
| `createUser(request, {username, password, email?})` | `POST /admin/users` | `AdminUser` |
| `getUser(request, userId)` | `GET /admin/users/:id` | `AdminUser` |
| `deleteUser(request, userId)` | `DELETE /admin/users/:id` | `void` |
| `resetPassword(request, userId, password)` | `POST /admin/users/:id/reset-password` | `void` |
| `getTotpCode(request, userId)` | `GET /admin/users/:id/totp/current` | `{code, remainingSeconds, totpEnabled}` |
| `generateEmailCode(request, userId)` | `POST /admin/users/:id/email-codes` | `{id, code, expiresAt}` |
| `deleteAllSessions(request)` | `DELETE /admin/sessions` | `number` (deleted count) |
| `deleteUserSessions(request, userId)` | `DELETE /admin/users/:id/sessions` | `number` (deleted count) |
| `resetDatabase(request)` | `POST /admin/reset` | `void` |

```ts
import { adminApi } from './e2e/fixtures/admin-api';

const user = await adminApi.createUser(request, { username: 'alice', password: 'pass' });
const { code } = await adminApi.getTotpCode(request, user.id);
await adminApi.resetDatabase(request);
```

**Test fixtures** (`test-fixtures.ts`): Extends Playwright's `test` with a `testUser` fixture that auto-creates a user before each test and cleans up after.

```ts
import { test, expect } from './e2e/fixtures';

test('login works', async ({ page, testUser }) => {
  // testUser.username, testUser.password, testUser.id available
});
```

### Layer 4: Specs (`e2e/specs/`)

Test files using layers 1-3. Currently scaffolded with test titles and TODOs.

## Admin API and test isolation

The admin API modifies the same database the web app reads. API calls during a test can affect the browser session in unexpected ways (e.g., deleting sessions invalidates cookies, deleting users orphans sessions). See the main [`README.md`](../README.md#using-the-admin-api-for-automated-testing) for a full side-effects table and test design guidelines.

Key rules:
- Create a unique user per test, clean up in teardown (the `testUser` fixture does this automatically)
- Don't call `POST /admin/reset` between individual tests — prefer per-user cleanup
- Use the API for setup (create users, enable MFA, fetch codes), use the browser for verification

## Constants (`e2e/constants.ts`)

Exports `ROUTES`, `ADMIN_ROUTES`, `MESSAGES`, and `TEST_DEFAULTS` — all the string values that tests and page objects need.

## External Consumption

Import from the barrel export:

```ts
import {
  // Selectors
  LOGIN, REGISTER, SHARED,
  // Page objects
  loginPage, registerPage, dashboardPage,
  // Fixtures
  adminApi, test, expect,
  // Constants
  ROUTES, MESSAGES,
} from '../path/to/auth-test-app/e2e';
```

The selectors layer has zero runtime dependencies, so even non-Playwright consumers can use it.

## File Structure

```
e2e/
├── constants.ts                 # ROUTES, ADMIN_ROUTES, MESSAGES
├── index.ts                     # barrel export
├── selectors/
│   ├── shared.ts                # alerts, password toggles, combo buttons
│   ├── login.ts
│   ├── multi-step-login.ts
│   ├── register.ts
│   ├── change-password.ts
│   ├── mfa-verify.ts
│   ├── dashboard.ts
│   └── passkey-conditional.ts
├── pages/
│   ├── index.ts
│   ├── login.ts
│   ├── multi-step-login.ts
│   ├── register.ts
│   ├── change-password.ts
│   ├── mfa-verify.ts
│   ├── dashboard.ts
│   └── passkey-conditional.ts
├── fixtures/
│   ├── index.ts
│   ├── admin-api.ts
│   └── test-fixtures.ts
└── specs/
    ├── login.spec.ts
    ├── multi-step-login.spec.ts
    ├── register.spec.ts
    ├── change-password.spec.ts
    ├── mfa.spec.ts
    └── dashboard.spec.ts
```
