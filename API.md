# Admin API

All endpoints are unauthenticated. Mount point: `/admin`

> This API exists for test tooling, not for production use. See [Security warnings](README.md#security-warnings).

## Endpoints

### Users

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/users` | List all users |
| `POST` | `/admin/users` | Create a user `{ username, password, email? }` |
| `GET` | `/admin/users/:id` | Full user detail: sessions, passkeys, email codes, TOTP secret, recent events |
| `PATCH` | `/admin/users/:id` | Update username, email, totpEnabled, emailMfaEnabled |
| `DELETE` | `/admin/users/:id` | Delete user |
| `POST` | `/admin/users/:id/reset-password` | Set new password `{ password }` |

### TOTP

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/users/:id/totp/current` | Get the live TOTP code + seconds remaining |
| `DELETE` | `/admin/users/:id/totp` | Disable TOTP for the user |

### Email codes

Email MFA does not send real emails. Codes are stored in the database and readable via API.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/admin/users/:id/email-codes` | Generate a new email code |
| `GET` | `/admin/users/:id/email-codes` | List active (unused, unexpired) codes |

### Passkeys

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/users/:id/passkeys` | List registered passkeys |
| `DELETE` | `/admin/users/:id/passkeys/:credentialId` | Remove a passkey |

### Sessions

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/sessions` | List all active sessions |
| `DELETE` | `/admin/sessions` | Delete all sessions |
| `DELETE` | `/admin/sessions/:id` | Delete a specific session |
| `DELETE` | `/admin/users/:id/sessions` | Delete all sessions for a user |

### Events

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/events?limit=100` | Auth event log (login attempts, MFA, passkey events) |

### Database

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/admin/reset` | Drop and recreate all tables — clean slate |

## Using the API for automated testing

The admin API is designed as the **test harness** for e2e tests — both for this app's own smoke tests and for external projects (e.g., browser extension test suites) that use auth-test-app as a test target.

### Why use the API instead of the UI for test setup

Seeding users, enabling MFA, and cleaning up via the admin panel UI is slow and brittle — it adds page loads, DOM waits, and couples test setup to the UI under test. The admin API lets tests set up state in milliseconds via HTTP calls, so the actual test can focus on the flow being verified.

### Side effects to be aware of

Admin API calls modify the same database the web app reads. API actions can affect an active browser session in ways that may or may not be desirable:

| Action | Web app impact |
|--------|---------------|
| `DELETE /admin/sessions` | Logs out every active browser session — existing cookies become invalid |
| `DELETE /admin/users/:id` | Any browser session for that user becomes orphaned (session cookie exists but user is gone) |
| `POST /admin/reset` | Wipes everything — all sessions, users, credentials gone mid-test |
| `POST /admin/users/:id/reset-password` | Existing sessions stay valid, but next login requires the new password |
| `PATCH /admin/users/:id` (toggle MFA) | Enabling MFA mid-session won't retroactively require verification for the current session |
| `DELETE /admin/users/:id/totp` | Disables TOTP, but an in-flight MFA verify page won't know until form submit |

### Guidelines for test design

- **Isolate per test.** Create a unique user per test (e.g., `test_${Date.now()}`). Delete it in teardown. Avoid shared users across parallel tests.
- **Don't reset the database mid-suite.** `POST /admin/reset` is for between full runs, not between individual tests. Prefer per-user cleanup.
- **Be deliberate about session state.** If a test logs in via the browser, then calls `DELETE /admin/sessions`, the browser still holds the cookie — the next page load will see an invalid session. This is useful for testing session expiry UX, but surprising if unintentional.
- **Prefer API setup, browser verification.** Create users and enable MFA via API, then verify the web flows in the browser. This keeps tests fast and focused.

### E2E test infrastructure

This repo includes an exportable Playwright test library in `e2e/` with selectors, page objects, and admin API fixtures. See [`e2e/README.md`](e2e/README.md) for details.

```bash
bun run test:e2e   # run all specs (auto-starts dev server if needed)
```
