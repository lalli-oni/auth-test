import { Hono } from 'hono';
import { logAuthEvent } from '../services/auth-event.service';
import {
  createEmailCode,
  verifyEmailCode,
} from '../services/email-code.service';
import { updateSessionMfaVerified } from '../services/session.service';
import {
  disableTotp,
  setupTotp,
  verifyTotp,
  verifyTotpAndEnable,
} from '../services/totp.service';
import { updateUser } from '../services/user.service';
import { MfaVerifyPage } from '../views/pages/mfa-verify';

const mfa = new Hono();

// MFA verification page
mfa.get('/verify', (c) => {
  const session = c.get('session');
  const user = c.get('user');

  if (!session || !user) {
    return c.redirect('/login');
  }

  if (session.mfa_verified) {
    return c.redirect('/dashboard');
  }

  if (!user.totp_enabled && !user.email_mfa_enabled) {
    // No MFA enabled, mark as verified
    updateSessionMfaVerified(session.id, true);
    return c.redirect('/dashboard');
  }

  return c.html(<MfaVerifyPage user={user} />);
});

// TOTP Setup (returns QR code)
mfa.post('/totp/setup', async (c) => {
  const session = c.get('session');
  const user = c.get('user');

  if (!session || !user) {
    return c.json({ success: false, error: 'Not authenticated' }, 401);
  }

  const result = await setupTotp(user.id);
  if (!result) {
    return c.json({ success: false, error: 'Failed to setup TOTP' });
  }

  return c.json({
    success: true,
    qrCodeDataUrl: result.qrCodeDataUrl,
    secret: result.secret,
    otpauthUrl: result.otpauthUrl,
  });
});

// TOTP Enable (verify initial code and enable)
mfa.post('/totp/enable', async (c) => {
  const session = c.get('session');
  const user = c.get('user');

  if (!session || !user) {
    return c.json({ success: false, error: 'Not authenticated' }, 401);
  }

  const body = await c.req.json();
  const code = body.code as string;

  if (!code) {
    return c.json({ success: false, error: 'Code is required' });
  }

  const verified = verifyTotpAndEnable(user.id, code);
  if (!verified) {
    logAuthEvent('mfa_totp_failed', user.id, { action: 'enable' });
    return c.json({ success: false, error: 'Invalid code' });
  }

  logAuthEvent('mfa_totp_enabled', user.id);
  return c.json({ success: true });
});

// TOTP Verify (during login)
mfa.post('/totp/verify', async (c) => {
  const session = c.get('session');
  const user = c.get('user');

  if (!session || !user) {
    return c.redirect('/login');
  }

  const body = await c.req.parseBody();
  const code = body.code as string;

  if (!code) {
    return c.html(<MfaVerifyPage user={user} error="Code is required" />);
  }

  const verified = verifyTotp(user.id, code);
  if (!verified) {
    logAuthEvent('mfa_totp_failed', user.id, { action: 'verify' });
    return c.html(<MfaVerifyPage user={user} error="Invalid code" />);
  }

  updateSessionMfaVerified(session.id, true);
  logAuthEvent('mfa_totp_verified', user.id);

  return c.redirect('/dashboard');
});

// TOTP Disable
mfa.post('/totp/disable', (c) => {
  const session = c.get('session');
  const user = c.get('user');

  if (!session || !user) {
    return c.redirect('/login');
  }

  disableTotp(user.id);
  logAuthEvent('mfa_totp_disabled', user.id);

  return c.redirect('/dashboard');
});

// Email MFA Enable
mfa.post('/email/enable', (c) => {
  const session = c.get('session');
  const user = c.get('user');

  if (!session || !user) {
    return c.redirect('/login');
  }

  updateUser(user.id, { email_mfa_enabled: true });
  logAuthEvent('mfa_email_enabled', user.id);

  return c.redirect('/dashboard');
});

// Email MFA Disable
mfa.post('/email/disable', (c) => {
  const session = c.get('session');
  const user = c.get('user');

  if (!session || !user) {
    return c.redirect('/login');
  }

  updateUser(user.id, { email_mfa_enabled: false });
  logAuthEvent('mfa_email_disabled', user.id);

  return c.redirect('/dashboard');
});

// Email Code Send (simulated - code shown in admin panel)
mfa.post('/email/send', (c) => {
  const session = c.get('session');
  const user = c.get('user');

  if (!session || !user) {
    return c.redirect('/login');
  }

  const emailCode = createEmailCode(user.id);
  logAuthEvent('mfa_email_sent', user.id, { code: emailCode.code });

  // In a real app, this would send an email
  // For testing, the code is visible in the admin panel

  return c.html(
    <MfaVerifyPage
      user={user}
      error={`Code sent! (For testing, check the admin panel - code: ${emailCode.code})`}
    />,
  );
});

// Email Code Verify
mfa.post('/email/verify', async (c) => {
  const session = c.get('session');
  const user = c.get('user');

  if (!session || !user) {
    return c.redirect('/login');
  }

  const body = await c.req.parseBody();
  const code = body.code as string;

  if (!code) {
    return c.html(<MfaVerifyPage user={user} error="Code is required" />);
  }

  const verified = verifyEmailCode(user.id, code);
  if (!verified) {
    logAuthEvent('mfa_email_failed', user.id);
    return c.html(
      <MfaVerifyPage user={user} error="Invalid or expired code" />,
    );
  }

  updateSessionMfaVerified(session.id, true);
  logAuthEvent('mfa_email_verified', user.id);

  return c.redirect('/dashboard');
});

export default mfa;
