import { Hono } from 'hono';
import {
  clearSessionCookie,
  getClientIP,
  requireMfaVerified,
  setSessionCookie,
} from '../middleware/session';
import { logAuthEvent } from '../services/auth-event.service';
import { createSession, deleteSession } from '../services/session.service';
import {
  createUser,
  getUserByUsername,
  updatePassword,
  verifyPassword,
} from '../services/user.service';
import type { ChangePasswordOptions } from '../views/pages/change-password';
import { ChangePasswordPage } from '../views/pages/change-password';
import { LoginPage } from '../views/pages/login';
import { MultiStepLoginPage } from '../views/pages/multi-step-login';
import { RegisterPage } from '../views/pages/register';

const auth = new Hono();

function isAjax(c: { req: { header: (name: string) => string | undefined } }) {
  return c.req.header('X-Requested-With') === 'XMLHttpRequest';
}

// Login page
auth.get('/login', (c) => {
  const session = c.get('session');
  const redirected = c.req.query('redirected') === 'true';
  if (session && !redirected) {
    return c.redirect('/dashboard');
  }
  return c.html(<LoginPage />);
});

// Login handler
auth.post('/login', async (c) => {
  const body = await c.req.parseBody();
  const username = body.username as string;
  const password = body.password as string;

  const useFetch = body.use_fetch === '1';
  const stayOnPage = body.stay_on_page === '1';
  const redirectToLogin = body.redirect_to_login === '1';
  const source = body.source as string | undefined;
  const ajax = useFetch && isAjax(c);

  const renderError = (error: string) => {
    if (ajax) return c.json({ error });
    if (source === 'multi-step') {
      return c.html(
        <MultiStepLoginPage
          error={error}
          useFetch={useFetch}
          stayOnPage={stayOnPage}
          redirectToLogin={redirectToLogin}
        />,
      );
    }
    return c.html(
      <LoginPage
        error={error}
        useFetch={useFetch}
        stayOnPage={stayOnPage}
        redirectToLogin={redirectToLogin}
      />,
    );
  };

  if (!username || !password) {
    return renderError('Username and password are required');
  }

  const user = getUserByUsername(username);
  if (!user) {
    logAuthEvent('login_failed', undefined, {
      username,
      reason: 'user_not_found',
    });
    return renderError('Invalid username or password');
  }

  const validPassword = await verifyPassword(user, password);
  if (!validPassword) {
    logAuthEvent('login_failed', user.id, { reason: 'invalid_password' });
    return renderError('Invalid username or password');
  }

  const hasMfa = user.totp_enabled || user.email_mfa_enabled;
  const wants2fa = (body.require_2fa as string) === '1';

  // Create session — bypass MFA if user unchecked "Login with 2FA"
  const session = createSession({
    userId: user.id,
    userAgent: c.req.header('User-Agent'),
    ipAddress: getClientIP(c),
    mfaVerified: !(wants2fa && hasMfa),
  });

  setSessionCookie(c, session.id);
  logAuthEvent('login_success', user.id);

  if (wants2fa && hasMfa) {
    if (ajax) return c.json({ redirect: '/mfa/verify' });
    return c.redirect('/mfa/verify');
  }

  // Handle post-success behavior
  const loginRedirect = redirectToLogin
    ? '/auth/login?redirected=true'
    : '/dashboard';

  if (ajax) {
    return c.json({
      success: 'Logged in successfully',
      redirect: stayOnPage ? undefined : loginRedirect,
    });
  }

  if (stayOnPage) {
    const PageComponent =
      source === 'multi-step' ? MultiStepLoginPage : LoginPage;
    return c.html(
      <PageComponent
        success="Logged in successfully"
        useFetch={useFetch}
        stayOnPage={stayOnPage}
        redirectToLogin={redirectToLogin}
      />,
    );
  }

  return c.redirect(loginRedirect);
});

// Register page
auth.get('/register', (c) => {
  const session = c.get('session');
  if (session) {
    return c.redirect('/dashboard');
  }
  return c.html(<RegisterPage />);
});

// Register handler
auth.post('/register', async (c) => {
  const body = await c.req.parseBody();
  const username = body.username as string;
  const email = body.email as string | undefined;
  const password = body.password as string;
  const confirmPassword = body.confirm_password as string;
  const useFetch = body.use_fetch === '1';
  const stayOnPage = body.stay_on_page === '1';
  const ajax = useFetch && isAjax(c);

  const renderError = (error: string) => {
    if (ajax) return c.json({ error });
    return c.html(
      <RegisterPage
        error={error}
        useFetch={useFetch}
        stayOnPage={stayOnPage}
      />,
    );
  };

  if (!username || !password) {
    return renderError('Username and password are required');
  }

  if (password !== confirmPassword) {
    return renderError('Passwords do not match');
  }

  const existingUser = getUserByUsername(username);
  if (existingUser) {
    return renderError('Username already taken');
  }

  try {
    const user = await createUser({ username, password, email });
    logAuthEvent('register', user.id);

    // Create session and log in
    const session = createSession({
      userId: user.id,
      userAgent: c.req.header('User-Agent'),
      ipAddress: getClientIP(c),
      mfaVerified: true, // No MFA enabled yet
    });

    setSessionCookie(c, session.id);

    if (ajax) {
      return c.json({
        success: 'Account created successfully',
        redirect: stayOnPage ? undefined : '/dashboard',
      });
    }

    if (stayOnPage) {
      return c.html(
        <RegisterPage
          success="Account created successfully"
          useFetch={useFetch}
          stayOnPage={stayOnPage}
        />,
      );
    }

    return c.redirect('/dashboard');
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to create account. Please try again.';
    return renderError(message);
  }
});

// Logout handler
auth.post('/logout', (c) => {
  const session = c.get('session');

  if (session) {
    logAuthEvent('logout', session.user_id);
    deleteSession(session.id);
  }

  clearSessionCookie(c);
  return c.redirect('/login');
});

// MFA status check (used by login page to conditionally enable 2FA checkbox)
auth.get('/mfa-status', (c) => {
  const username = c.req.query('username');
  if (!username) return c.json({ hasMfa: false });

  const user = getUserByUsername(username);
  if (!user) return c.json({ hasMfa: false });

  return c.json({ hasMfa: user.totp_enabled || user.email_mfa_enabled });
});

// Auth status API (for JS clients)
auth.get('/status', (c) => {
  const session = c.get('session');
  const user = c.get('user');

  if (!session || !user) {
    return c.json({ authenticated: false });
  }

  return c.json({
    authenticated: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      totpEnabled: user.totp_enabled,
      emailMfaEnabled: user.email_mfa_enabled,
    },
    session: {
      mfaVerified: session.mfa_verified,
      expiresAt: session.expires_at,
    },
  });
});

// Change password page
auth.get('/change-password', requireMfaVerified, (c) => {
  const user = c.get('user')!;
  const options: ChangePasswordOptions = {
    noCurrent: c.req.query('no_current') === '1',
    withConfirmation: c.req.query('with_confirmation') === '1',
  };
  return c.html(<ChangePasswordPage user={user} options={options} />);
});

// Change password handler
auth.post('/change-password', requireMfaVerified, async (c) => {
  const user = c.get('user')!;
  const body = await c.req.parseBody();
  const options: ChangePasswordOptions = {
    noCurrent: body.no_current === '1',
    withConfirmation: body.with_confirmation === '1',
  };
  const currentPassword = body.current_password as string;
  const newPassword = body.new_password as string;
  const confirmNewPassword = body.confirm_new_password as string;
  const useFetch = body.use_fetch === '1';
  const stayOnPage = body.stay_on_page === '1';
  const ajax = useFetch && isAjax(c);

  const renderError = (error: string) => {
    if (ajax) return c.json({ error });
    return c.html(
      <ChangePasswordPage
        user={user}
        options={options}
        useFetch={useFetch}
        stayOnPage={stayOnPage}
        error={error}
      />,
    );
  };

  if (!newPassword || newPassword.length < 6) {
    return renderError('New password must be at least 6 characters');
  }

  if (!options.noCurrent) {
    if (!currentPassword) {
      return renderError('Current password is required');
    }
    let valid: boolean;
    try {
      valid = await verifyPassword(user, currentPassword);
    } catch {
      return renderError(
        'Unable to verify current password. Please try again.',
      );
    }
    if (!valid) {
      return renderError('Current password is incorrect');
    }
  }

  if (options.withConfirmation && newPassword !== confirmNewPassword) {
    return renderError('New passwords do not match');
  }

  try {
    await updatePassword(user.id, newPassword);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to change password. Please try again.';
    return renderError(message);
  }

  logAuthEvent('password_changed', user.id);

  if (ajax) {
    return c.json({
      success: 'Password changed successfully',
      redirect: stayOnPage ? undefined : '/dashboard',
    });
  }

  if (stayOnPage) {
    return c.html(
      <ChangePasswordPage
        user={user}
        options={options}
        useFetch={useFetch}
        stayOnPage={stayOnPage}
        success="Password changed successfully"
      />,
    );
  }

  return c.redirect('/dashboard');
});

export default auth;
