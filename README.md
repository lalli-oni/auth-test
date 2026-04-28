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

See [`API.md`](API.md) for the full endpoint reference, side-effect table, and guidelines for using the API as an e2e test harness.

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