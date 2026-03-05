# Auth Test App

A local authentication testing platform for password managers, browser extensions, and WebAuthn/passkey implementations. It deliberately exposes internals that a production app would never expose, so automated tools can inspect and control auth state without screen-scraping or guesswork.

> **Not for production.** This app is intentionally insecure by design. Run it locally only.

## What it's for

Testing tools that interact with authentication flows — password managers, browser extensions, passkey clients, and similar software. It provides:

- A realistic set of auth flows to interact with (login, register, MFA, passkeys)
- An unauthenticated admin API to read and manipulate auth state programmatically
- Full visibility into internal state (TOTP secrets, email codes, sessions) without needing real email or authenticator apps

## Auth flows

| Flow | URL | Notes |
|------|-----|-------|
| Register | `/register` | Username + password |
| Login | `/login` | Password, passkey, or conditional passkey |
| Passkey (conditional) | `/passkey-conditional` | Auto-triggers WebAuthn conditional mediation on load |
| TOTP MFA | `/mfa/verify` | After login, if TOTP is enabled |
| Email MFA | `/mfa/verify` | After login, if email MFA is enabled |
| Dashboard | `/dashboard` | Reached after successful (+ MFA) login |

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