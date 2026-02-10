# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun install          # Install dependencies
bun run dev          # Run with hot reload (development)
bun run start        # Run without hot reload
bun test             # Run tests (no tests exist yet)
bun run lint         # Check linting & formatting (Biome)
bun run lint:fix     # Auto-fix lint & formatting issues
bun run format       # Check formatting only
bun run format:fix   # Auto-fix formatting only
```

## Tech Stack

- **Runtime**: Bun (not Node.js)
- **Framework**: Hono (not Express)
- **Database**: SQLite via `bun:sqlite` (not better-sqlite3)
- **Views**: Hono JSX (server-rendered TSX)
- **WebAuthn**: @simplewebauthn/server
- **TOTP**: otplib

## Architecture

```
src/
├── index.tsx           # Entry point, Hono app setup, route mounting
├── db/
│   ├── database.ts     # SQLite connection singleton
│   └── schema.ts       # Table definitions (users, sessions, passkey_credentials, etc.)
├── middleware/
│   └── session.ts      # Session middleware, auth helpers (requireAuth, requireMfaVerified)
├── routes/
│   ├── auth.tsx        # Login/register/logout routes
│   ├── mfa.tsx         # TOTP and email MFA routes
│   ├── webauthn.ts     # Passkey registration/authentication API
│   └── admin.ts        # Admin API (no auth - testing only)
├── services/           # Business logic layer
│   ├── user.service.ts
│   ├── session.service.ts
│   ├── webauthn.service.ts
│   ├── totp.service.ts
│   └── email-code.service.ts
├── views/
│   ├── layout.tsx      # Base HTML layout with admin sidebar
│   ├── pages/          # Page components (dashboard, login, register, mfa-verify)
│   └── scripts/        # Client-side JS rendered as strings
public/
├── css/styles.css      # Styles
└── js/                 # Client-side JavaScript (webauthn.js, dashboard.js, admin.js)
```

## Key Patterns

**Session Context**: Middleware sets `session` and `user` on Hono context. Access via `c.get("session")` and `c.get("user")`.

**MFA Flow**: After password login, if user has TOTP/email MFA enabled, session.mfa_verified is false. User must complete `/mfa/verify` before accessing protected routes.

**Views**: Use Hono's JSX (`import type { FC } from "hono/jsx"`). Forms should use lowercase `method="post"` (not `"POST"`).

**Client Scripts**: Place in `public/js/`. Load via `<script src="/js/filename.js">`. Avoid `dangerouslySetInnerHTML`.

## Bun-Specific

- Bun auto-loads `.env` - don't use dotenv
- Use `Bun.file()` over `node:fs` readFile/writeFile
- Use `bun:sqlite` for database operations
