import { Hono } from 'hono';
import { requireMfaVerified } from '../middleware/session';
import { getCredentialsByUserId } from '../services/webauthn.service';
import { DashboardPage } from '../views/pages/dashboard';

const dashboard = new Hono();

dashboard.get('/', requireMfaVerified, (c) => {
  const user = c.get('user')!;
  const session = c.get('session')!;

  const passkeys = getCredentialsByUserId(user.id);
  const success = c.req.query('message');
  const error = c.req.query('error');

  return c.html(
    <DashboardPage
      user={user}
      session={session}
      passkeys={passkeys}
      success={success}
      error={error}
    />,
  );
});

export default dashboard;
