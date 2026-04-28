# E2E Test Infrastructure

## Purpose

Exportable Playwright test library for auth-test-app. Selectors and page objects are designed for reuse by external projects (e.g., browser extension tests).

## Architecture

Four layers with increasing dependency:

1. **Selectors** (`selectors/`) — pure string constants, zero dependencies
2. **Page objects** (`pages/`) — functional objects, depend on Playwright `Page`
3. **Fixtures** (`fixtures/`) — admin API helpers + Playwright test fixtures
4. **Specs** (`specs/`) — test files, depend on all above

External consumers import layers 1-3 via `e2e/index.ts`.

## Key Patterns

**Selectors are CSS strings, not Playwright locators.** This keeps them framework-agnostic. Page objects wrap them in `page.locator()` calls.

**Page objects are functional, not class-based.** Each exports a plain object with async methods. Every method takes `page: Page` as its first argument.

**Admin API helpers are standalone.** They only depend on Playwright's `APIRequestContext` type. They wrap `/admin/*` endpoints for test setup: creating users, fetching TOTP codes, resetting the database.

**Test fixtures auto-manage user lifecycle.** The `testUser` fixture creates a user with a unique name before each test and deletes it after.

## Adding a New Page

1. Add selectors in `selectors/<page>.ts` — export a `const` object
2. Add page object in `pages/<page>.ts` — import selectors, export functional object
3. Re-export from `pages/index.ts` and `index.ts`
4. Add spec in `specs/<page>.spec.ts`

## Adding a New Selector

Add it to the appropriate `selectors/*.ts` file. Use the element's `id` when available (`#foo`), otherwise use semantic CSS selectors (`form[action="/auth/login"]`, `button[type="submit"]`).

## Selector Naming Convention

- `FORM` — the `<form>` element
- `USERNAME`, `PASSWORD` — input fields by purpose
- `SUBMIT_BTN`, `BACK_BTN` — buttons
- `USE_FETCH`, `STAY_ON_PAGE` — variant checkboxes (use `input[name="..."]`)
- `*_LINK` — navigation links

## Constants

`constants.ts` contains `ROUTES` (app URLs), `ADMIN_ROUTES` (admin API URLs), `MESSAGES` (exact server-side error/success strings), and `TEST_DEFAULTS`.

When the server changes an error message, update `MESSAGES` to match.

## Running Tests

```bash
bun run test:e2e           # all specs
bunx playwright test login # single spec
```

The `webServer` config in `playwright.config.ts` auto-starts `bun run dev` if port 3000 is free.
