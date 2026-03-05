import { Hono } from 'hono';
import {
  getClientIP,
  requireAuthApi,
  setSessionCookie,
} from '../middleware/session';
import { logAuthEvent } from '../services/auth-event.service';
import {
  createSession,
  updateSessionMfaVerified,
} from '../services/session.service';
import {
  deleteCredential,
  generateAuthenticationOptionsForUser,
  generateRegistrationOptionsForUser,
  verifyAuthenticationResponseForUser,
  verifyRegistrationResponseForUser,
} from '../services/webauthn.service';

const webauthn = new Hono();

// Registration: Get options
webauthn.post('/register/options', requireAuthApi, async (c) => {
  const user = c.get('user')!;

  const result = await generateRegistrationOptionsForUser(user.id);
  if (!result) {
    return c.json({ success: false, error: 'Failed to generate options' });
  }

  return c.json({
    success: true,
    options: result.options,
    requestToken: result.requestToken,
  });
});

// Registration: Verify response
webauthn.post('/register/verify', requireAuthApi, async (c) => {
  const user = c.get('user')!;

  const body = await c.req.json();
  const { response, requestToken, friendlyName } = body;

  if (!response) {
    return c.json({ success: false, error: 'Response is required' });
  }

  if (!requestToken) {
    return c.json({ success: false, error: 'Request token is required' });
  }

  const result = await verifyRegistrationResponseForUser(
    user.id,
    response,
    requestToken,
    friendlyName,
  );

  if (result.verified) {
    logAuthEvent('passkey_registered', user.id, { friendlyName });
    return c.json({ success: true });
  }

  logAuthEvent('passkey_auth_failed', user.id, {
    action: 'register',
    error: result.error,
  });
  return c.json({ success: false, error: result.error });
});

// Authentication: Get options (can be called without session for passkey-only login)
webauthn.post('/auth/options', async (c) => {
  const user = c.get('user');

  // If user is logged in, limit to their credentials
  const result = await generateAuthenticationOptionsForUser(user?.id);

  return c.json({
    success: true,
    options: result.options,
    requestToken: result.requestToken,
  });
});

// Authentication: Verify response
webauthn.post('/auth/verify', async (c) => {
  const body = await c.req.json();
  const { response, requestToken } = body;

  if (!response) {
    return c.json({ success: false, error: 'Response is required' });
  }

  if (!requestToken) {
    return c.json({ success: false, error: 'Request token is required' });
  }

  const session = c.get('session');

  const result = await verifyAuthenticationResponseForUser(
    response,
    requestToken,
    session?.user_id,
  );

  if (result.verified && result.userId) {
    // If user is already logged in and just verifying MFA with passkey
    if (session && session.user_id === result.userId) {
      updateSessionMfaVerified(session.id, true);
      logAuthEvent('passkey_auth_success', result.userId, { action: 'mfa' });
      return c.json({ success: true, action: 'mfa_verified' });
    }

    // Create new session for passkey-only login
    const newSession = createSession({
      userId: result.userId,
      userAgent: c.req.header('User-Agent'),
      ipAddress: getClientIP(c),
      mfaVerified: true, // Passkey login counts as MFA
    });

    setSessionCookie(c, newSession.id);
    logAuthEvent('passkey_auth_success', result.userId, { action: 'login' });

    return c.json({ success: true, action: 'logged_in' });
  }

  logAuthEvent('passkey_auth_failed', session?.user_id, {
    action: 'auth',
    error: result.error,
  });
  return c.json({ success: false, error: result.error });
});

// Delete credential
webauthn.delete('/credential/:id', requireAuthApi, (c) => {
  const user = c.get('user')!;
  const credentialId = c.req.param('id');

  const deleted = deleteCredential(credentialId, user.id);

  if (!deleted) {
    return c.json({ success: false, error: 'Credential not found' });
  }

  logAuthEvent('passkey_deleted', user.id, { credentialId });

  return c.json({ success: true });
});

export default webauthn;
