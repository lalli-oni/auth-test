import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { getDatabase } from './db/database';
import { sessionMiddleware } from './middleware/session';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import mfaRoutes from './routes/mfa';
import webauthnRoutes from './routes/webauthn';
import { Layout } from './views/layout';
import { PasskeyPage } from './views/pages/passkey';

const app = new Hono();

// Initialize database
getDatabase();

// Static files
app.use('/css/*', serveStatic({ root: './public' }));
app.use('/js/*', serveStatic({ root: './public' }));

// Session middleware for all routes
app.use('*', sessionMiddleware);

// Mount routes
app.route('/auth', authRoutes);
app.route('/mfa', mfaRoutes);
app.route('/webauthn', webauthnRoutes);
app.route('/admin', adminRoutes);
app.route('/dashboard', dashboardRoutes);

// Home page
app.get('/', (c) => {
  const session = c.get('session');
  const user = c.get('user');

  if (session && user) {
    return c.redirect('/dashboard');
  }

  return c.html(
    <Layout title="Home">
      <div class="hero">
        <h2>Welcome to Auth Test App</h2>
        <p>A testing environment for authentication flows including:</p>
        <ul>
          <li>Username/Password authentication</li>
          <li>Passkeys (WebAuthn)</li>
          <li>Two-Factor Authentication (TOTP & Email codes)</li>
        </ul>
        <p>Use this app to test password managers and browser extensions.</p>
        <div class="hero-actions">
          <a href="/login" class="btn btn-primary">
            Login
          </a>
          <a href="/register" class="btn btn-secondary">
            Register
          </a>
        </div>
      </div>
    </Layout>,
  );
});

// Login/Register redirects
app.get('/login', (c) => c.redirect('/auth/login'));
app.get('/register', (c) => c.redirect('/auth/register'));

// Standalone passkey pages (auto-trigger WebAuthn on load)
app.get('/passkey-conditional', (c) =>
  c.html(<PasskeyPage mediation="conditional" />),
);

// Start server
const port = 3000;
console.log(`Auth Test App running at http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
