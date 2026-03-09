import type { Context, MiddlewareHandler, Next } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { getValidSession, type Session } from '../services/session.service';
import { getUserById, type User } from '../services/user.service';

const SESSION_COOKIE_NAME = 'session_id';

export interface SessionContext {
  session: Session | null;
  user: User | null;
}

declare module 'hono' {
  interface ContextVariableMap {
    session: Session | null;
    user: User | null;
  }
}

export async function sessionMiddleware(c: Context, next: Next) {
  const sessionId = getCookie(c, SESSION_COOKIE_NAME);

  let session: Session | null = null;
  let user: User | null = null;

  if (sessionId) {
    session = getValidSession(sessionId);
    if (session) {
      user = getUserById(session.user_id);
    }
  }

  c.set('session', session);
  c.set('user', user);

  await next();
}

export function setSessionCookie(c: Context, sessionId: string): void {
  setCookie(c, SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: 'Lax',
    path: '/',
    maxAge: 24 * 60 * 60, // 24 hours
  });
}

export function clearSessionCookie(c: Context): void {
  deleteCookie(c, SESSION_COOKIE_NAME, {
    path: '/',
  });
}

export function getClientIP(c: Context): string | undefined {
  return c.req.header('X-Forwarded-For') ?? c.req.header('X-Real-IP');
}

// Middleware for HTML routes — redirects to /login on failure
export const requireAuth: MiddlewareHandler = async (c, next) => {
  const session = c.get('session');
  const user = c.get('user');

  if (!session || !user) {
    return c.redirect('/login');
  }

  await next();
};

// Middleware for JSON API routes — returns 401 on failure
export const requireAuthApi: MiddlewareHandler = async (c, next) => {
  const session = c.get('session');
  const user = c.get('user');

  if (!session || !user) {
    return c.json({ success: false, error: 'Not authenticated' }, 401);
  }

  await next();
};

// Middleware for routes that require completed MFA — redirects on failure
export const requireMfaVerified: MiddlewareHandler = async (c, next) => {
  const session = c.get('session');
  const user = c.get('user');

  if (!session || !user) {
    return c.redirect('/login');
  }

  if ((user.totp_enabled || user.email_mfa_enabled) && !session.mfa_verified) {
    return c.redirect('/mfa/verify');
  }

  await next();
};
