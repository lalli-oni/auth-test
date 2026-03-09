import { Hono } from 'hono';
import { requireAuth, requireAuthApi } from '../middleware/session';
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
mfa.get('/verify', requireAuth, (c) => {
  const session = c.get('session')!;
  const user = c.get('user')!;

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
mfa.post('/totp/setup', requireAuthApi, async (c) => {
  const user = c.get('user')!;

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
mfa.post('/totp/enable', requireAuthApi, async (c) => {
  const user = c.get('user')!;

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
mfa.post('/totp/verify', requireAuth, async (c) => {
  const session = c.get('session')!;
  const user = c.get('user')!;

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
mfa.post('/totp/disable', requireAuth, (c) => {
  const user = c.get('user')!;

  disableTotp(user.id);
  logAuthEvent('mfa_totp_disabled', user.id);

  return c.redirect('/dashboard');
});

// Email MFA Enable
mfa.post('/email/enable', requireAuth, (c) => {
  const user = c.get('user')!;

  updateUser(user.id, { email_mfa_enabled: true });
  logAuthEvent('mfa_email_enabled', user.id);

  return c.redirect('/dashboard');
});

// Email MFA Disable
mfa.post('/email/disable', requireAuth, (c) => {
  const user = c.get('user')!;

  updateUser(user.id, { email_mfa_enabled: false });
  logAuthEvent('mfa_email_disabled', user.id);

  return c.redirect('/dashboard');
});

// Email Code Send (simulated - code shown in admin panel)
mfa.post('/email/send', requireAuth, (c) => {
  const user = c.get('user')!;

  const emailCode = createEmailCode(user.id);
  logAuthEvent('mfa_email_sent', user.id, { code: emailCode.code });

  // In a real app, this would send an email.
  // For testing, the code is also visible in the admin panel.
  return c.html(
    <MfaVerifyPage
      user={user}
      message={`Code sent! (For testing, code: ${emailCode.code})`}
    />,
  );
});

// Email Code Verify
mfa.post('/email/verify', requireAuth, async (c) => {
  const session = c.get('session')!;
  const user = c.get('user')!;

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
