# Auth Test App

A local authentication testing platform for password managers, browser extensions, and WebAuthn/passkey implementations. It deliberately exposes internals that a production app would never expose, so automated tools can inspect and control auth state without screen-scraping or guesswork.

> **Not for production.** This app is intentionally insecure by design. Run it locally only.

## What it's for

Testing tools that interact with authentication flows — password managers, browser extensions, passkey clients, and similar software. It provides:

- A realistic set of auth flows to interact with (login, register, MFA, passkeys)
- An unauthenticated admin API to read and manipulate auth state programmatically
- Full visibility into internal state (TOTP secrets, email codes, sessions) without needing real email or authenticator apps

## Auth flows

| Flow | Status | Password | MFA | Passkey | Notes |
|------|--------|----------|-----|---------|-------|
| **Login** | | | | | |
| &nbsp;&nbsp;↳ Password | Implemented | ✓ | Optional (TOTP or email code) | — | MFA checkbox on form; bypassed if unchecked |
| &nbsp;&nbsp;↳ Passkey | Implemented | — | — | ✓ | Multiple mediation modes (conditional, optional, required, silent) |
| &nbsp;&nbsp;↳ Passkey (dedicated page) | Implemented | — | — | ✓ | `/passkey-conditional` — auto-triggers conditional mediation on load |
| &nbsp;&nbsp;↳ Identifier-first → password | Not implemented | ✓ | Optional | — | Username on step 1, password on step 2 |
| &nbsp;&nbsp;↳ Identifier-first → passkey | Not implemented | — | — | ✓ | Username on step 1, passkey prompt on step 2 |
| &nbsp;&nbsp;↳ Identifier-first → code | Not implemented | — | TOTP or email code | — | Username on step 1, code entry on step 2 |
| **Registration / Onboarding** | | | | | |
| &nbsp;&nbsp;↳ Password registration | Implemented | ✓ | — | — | Email optional, not verified |
| &nbsp;&nbsp;↳ Passwordless (passkey-only) | Not implemented | — | — | ✓ | Registration always requires a password today |
| **MFA** | | | | | |
| &nbsp;&nbsp;↳ MFA verify (post-login) | Implemented | — | TOTP or email code | — | Triggered when session `mfa_verified: false` |
| &nbsp;&nbsp;↳ TOTP setup | Implemented | — | TOTP (setup) | — | QR code + manual entry; code verified before enabling |
| &nbsp;&nbsp;↳ Email MFA enable/disable | Implemented | — | Email code (toggle) | — | No verification on enable; codes fetched via admin API |
| &nbsp;&nbsp;↳ Backup / recovery codes | Not implemented | — | — | — | No fallback if TOTP device lost |
| **Passkeys** | | | | | |
| &nbsp;&nbsp;↳ Register passkey | Implemented | — | — | ✓ | From dashboard, requires active session |
| &nbsp;&nbsp;↳ Delete passkey | Implemented | — | — | ✓ | From dashboard |
| **Account management** | | | | | |
| &nbsp;&nbsp;↳ Logout | Implemented | — | — | — | Clears session from DB and cookie |
| &nbsp;&nbsp;↳ Forgot password | Not implemented | — | — | — | No reset flow |
| &nbsp;&nbsp;↳ Email verification | Not implemented | — | — | — | Email stored but never verified |
| &nbsp;&nbsp;↳ Login history (user-facing) | Not implemented | — | — | — | Auth events in DB, admin-only |
| &nbsp;&nbsp;↳ Social / OAuth | Not implemented | — | — | — | Out of scope |

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