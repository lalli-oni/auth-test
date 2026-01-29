# Auth Test App - Claude Rules

## Overview

This is a **Bun + Hono** authentication testing application demonstrating multi-factor authentication (TOTP, Email codes, WebAuthn/Passkeys) with SQLite storage.

## Runtime & Tooling

Default to **Bun** instead of Node.js.

- `bun <file>` instead of `node <file>` or `ts-node <file>`
- `bun test` instead of `jest` or `vitest`
- `bun install` instead of `npm install`
- `bun run <script>` instead of `npm run <script>`
- `bunx <package>` instead of `npx <package>`
- Bun automatically loads `.env` - never use `dotenv`

### Bun-Native APIs (Required)

- `bun:sqlite` for SQLite - never use `better-sqlite3`
- `Bun.password.hash()` / `Bun.password.verify()` for password hashing
- `Bun.file()` over `node:fs` readFile/writeFile
- WebSocket is built-in - never use `ws`

### Forbidden Packages

Do not add: `express`, `better-sqlite3`, `pg`, `ioredis`, `ws`, `dotenv`, `bcrypt`, `vite`

## Project Structure

```
src/
├── index.tsx           # App entry point, Hono app setup
├── db/
│   ├── database.ts     # Database singleton via getDatabase()
│   └── schema.ts       # SQLite schema definitions
├── middleware/
│   └── session.ts      # Session middleware, auth checks
├── routes/
│   ├── auth.tsx        # Login/register/logout
│   ├── mfa.tsx         # TOTP & email code verification
│   ├── webauthn.ts     # Passkey registration/authentication
│   └── admin.ts        # Admin API (unprotected for testing)
├── services/
│   ├── user.service.ts       # User CRUD
│   ├── session.service.ts    # Session management
│   ├── totp.service.ts       # TOTP generation/verification
│   ├── webauthn.service.ts   # WebAuthn challenge/verify
│   ├── email-code.service.ts # Email code generation
│   └── auth-event.service.ts # Audit logging
└── views/
    ├── layout.tsx      # Main layout wrapper
    ├── pages/          # Page components (login, register, dashboard, etc.)
    └── scripts/        # Client-side TypeScript
public/
├── css/styles.css      # Global styles
└── js/webauthn.js      # Client-side WebAuthn
```

## Code Patterns

### Database Access

Always use `getDatabase()` singleton. Use parameterized queries.

```typescript
import { getDatabase } from "../db/database";

const db = getDatabase();
const user = db.query("SELECT * FROM users WHERE id = ?").get(userId) as User | null;
db.run("INSERT INTO users (username, email) VALUES (?, ?)", [username, email]);
```

### Service Layer

Services handle business logic and database operations. Export typed interfaces and pure functions.

```typescript
// services/example.service.ts
export interface Example {
  id: number;
  name: string;
}

export function getExampleById(id: number): Example | null {
  const db = getDatabase();
  return db.query("SELECT * FROM examples WHERE id = ?").get(id) as Example | null;
}
```

### Routes (Hono)

Use Hono's routing with TypeScript. Always type context variables.

```typescript
import { Hono } from "hono";
import type { Variables } from "../middleware/session";

const app = new Hono<{ Variables: Variables }>();

app.get("/example", (c) => {
  const user = c.get("user");
  return c.json({ user });
});
```

### Views (Hono JSX)

Use `hono/jsx` for server-side rendering. Components are functions returning JSX.

```tsx
import type { FC } from "hono/jsx";

interface Props {
  title: string;
  children: any;
}

export const Layout: FC<Props> = ({ title, children }) => (
  <html>
    <head><title>{title}</title></head>
    <body>{children}</body>
  </html>
);
```

### Session Middleware Pattern

Session data is loaded lazily via middleware. Access via `c.get()`:

```typescript
const session = c.get("session");  // Session | null
const user = c.get("user");        // User | null
```

## Authentication Architecture

### Password Handling

```typescript
// Hashing (registration)
const passwordHash = await Bun.password.hash(password);

// Verification (login)
const valid = await Bun.password.verify(password, user.password_hash);
```

### Session Flow

1. Login creates session via `createSession(userId, userAgent, ip)`
2. Session ID stored in `session_id` cookie (httpOnly, sameSite: "Lax")
3. Middleware loads session/user on each request
4. MFA required users have `session.mfa_verified = 0` until verified

### MFA Types

- **TOTP**: Secret stored in `users.totp_secret`, enabled via `users.totp_enabled`
- **Email Codes**: 6-digit codes in `email_codes` table, 10-minute expiry
- **WebAuthn**: Credentials in `passkey_credentials`, challenges in `webauthn_challenges`

## Database Schema

Key tables: `users`, `sessions`, `passkey_credentials`, `webauthn_challenges`, `email_codes`, `auth_events`

Foreign keys are enabled (`PRAGMA foreign_keys = ON`). Always maintain referential integrity.

## Testing

```typescript
import { test, expect } from "bun:test";

test("example test", () => {
  expect(1 + 1).toBe(2);
});
```

Run with `bun test`. Test files: `*.test.ts`

## Security Considerations

- Admin routes (`/admin/*`) are unprotected for testing purposes
- Always use parameterized SQL queries (no string concatenation)
- Password minimum: 6 characters
- Session expiration: 24 hours
- WebAuthn challenges expire: 5 minutes
- Email codes expire: 10 minutes

## Development

```bash
bun run dev      # Start with hot reload (bun --hot src/index.tsx)
bun run start    # Production start
```

Server runs on `http://localhost:3000`

## WebAuthn Configuration

Hardcoded for localhost development:
- RP_ID: "localhost"
- ORIGIN: "http://localhost:3000"

Update these for production deployment.
