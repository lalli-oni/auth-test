# Auth Test App

A local authentication testing platform for password managers, browser extensions, and WebAuthn/passkey implementations. It deliberately exposes internals that a production app would never expose, so automated tools can inspect and control auth state without screen-scraping or guesswork.

> **Not for production.** This app is intentionally insecure by design. Run it locally only.

## What it's for

Testing tools that interact with authentication flows — password managers, browser extensions, passkey clients, and similar software. It provides:

- A realistic set of auth flows to interact with (login, register, MFA, passkeys)
- An unauthenticated admin API to read and manipulate auth state programmatically
- Full visibility into internal state (TOTP secrets, email codes, sessions) without needing real email or authenticator apps

## Security warnings

> **⚠️ This app stores plaintext passwords, exposes all secrets via unauthenticated APIs, and has no security controls. Treat it as fully compromised by design.**

### Password reuse and shared machines

- **Password reuse is dangerous here.** Every password is stored in cleartext (`password_plaintext` column) and exposed via the admin API. If someone registers with a password they use elsewhere, that password is immediately readable by anyone with network access.
- **Shared machines are unsafe.** Anyone on the machine can hit `GET /admin/users/:id` and read all passwords, TOTP secrets, active sessions, and email codes. There is no authentication on any admin endpoint.

### Sensitive data stored in the clear

- **Plaintext password storage** — every password is stored unhashed in `password_plaintext` alongside the bcrypt hash. This is intentional for test inspection, but means the DB contains every credential in cleartext.
- **TOTP secrets in plaintext** — stored unencrypted in the database, readable via admin API. Anyone with the secret can generate valid TOTP codes.
- **Unauthenticated admin API** — all `/admin/*` endpoints require no credentials. Anyone who can reach the server can read all passwords, TOTP secrets, sessions, and email codes.
- **Database file unencrypted on disk** — the SQLite file contains all secrets, protected only by filesystem permissions.
- **Weak email code randomness** — email verification codes use `Math.random()`, not a cryptographically secure random source.

### Application-level vulnerabilities

- **No HTTPS** — all traffic is plain HTTP. Credentials are sent in cleartext, vulnerable to interception on non-localhost networks.
- **No rate limiting** — unlimited login, registration, and MFA attempts. Brute force is trivial.
- **Session cookies without `Secure` flag** — cookies are sent over HTTP and can be intercepted if the server is not on localhost.
- **Network binding** — defaults to localhost, but can be exposed to the network with `--hostname 0.0.0.0`, making all of the above remotely exploitable.
- **Database reset endpoint** — `POST /admin/reset` drops and recreates all tables with no authentication. One request wipes everything.
- **MFA bypass by design** — a checkbox on the login form lets users skip MFA verification even when MFA is enabled.

### Safe usage checklist

- **Do** run on localhost only
- **Do** use throwaway passwords you don't use anywhere else
- **Do** reset the database (`POST /admin/reset`) when done testing
- **Don't** expose this to a network (no `--hostname 0.0.0.0` in shared environments)
- **Don't** register with real credentials (email, passwords, TOTP secrets from real accounts)
- **Don't** run this alongside production services on the same machine

## Auth flows and variants

See [`FLOWS.md`](FLOWS.md) for the full auth flow matrix, variant reference, compatibility tables, and test setup requirements.

## Admin API

All endpoints are unauthenticated. Mount point: `/admin`

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

## Using the Admin API for automated testing

The admin API is designed to be the **test harness** for e2e tests — both for this app's own smoke tests and for external projects (e.g., browser extension test suites) that use auth-test-app as a test target.

### Why use the API instead of the UI for test setup

Seeding users, enabling MFA, and cleaning up via the admin panel UI is slow and brittle — it adds page loads, DOM waits, and couples test setup to the UI under test. The admin API lets tests set up state in milliseconds via HTTP calls, so the actual test can focus on the flow being verified.

### Side effects to be aware of

Admin API calls modify the same database the web app reads. This means API actions can affect an active browser session in ways that may or may not be desirable:

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

## Similar projects

- [webtests.dev](https://webtests.dev/category/create/) — Bitwarden project with various authentication flows
- [passkeys.io](https://www.passkeys.io/) — General passkey testing
- [passkeyprf.com](https://www.passkeyprf.com/) — Passkey testing including PRF specifics

## Quick start

```bash
bun install
bun run dev     # http://localhost:3000
```

Requires [Bun](https://bun.sh). No other dependencies (SQLite is built in).

## Intentional security bypasses

These are features, not bugs:

- **Admin API has no authentication** — full control without credentials
- **TOTP secrets are exposed** — readable via `GET /admin/users/:id`
- **Live TOTP codes are served** — no authenticator app needed for testing
- **Email codes skip email delivery** — stored in DB, retrievable via API
- **Database can be fully reset** — instant clean state between test runs
- **Sessions can be force-deleted** — test logout/expiry behaviour on demand