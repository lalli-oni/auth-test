import type { FC } from 'hono/jsx';
import { Alert, AuthCard, FormGroup } from '../components';
import { Layout } from '../layout';

export interface LoginPageProps {
  error?: string;
  success?: string;
}

export const LoginPage: FC<LoginPageProps> = ({ error, success }) => (
  <Layout title="Login">
    <AuthCard title="Login">
      <Alert error={error} success={success} />

      <form action="/auth/login" method="post" class="auth-form">
        <FormGroup label="Username" htmlFor="username">
          <input
            type="text"
            id="username"
            name="username"
            autocomplete="username"
            required
            autofocus
          />
        </FormGroup>

        <FormGroup label="Password" htmlFor="password">
          <input
            type="password"
            id="password"
            name="password"
            autocomplete="current-password"
            required
          />
        </FormGroup>

        <div class="form-group">
          <label
            id="mfa-label"
            title="Enter your username to check 2FA availability"
          >
            <input
              type="checkbox"
              id="require_2fa"
              name="require_2fa"
              value="1"
              disabled
            />{' '}
            Login with 2FA
          </label>
        </div>

        <button type="submit" class="btn btn-primary">
          Login
        </button>
      </form>

      <div class="auth-divider">
        <span>or</span>
      </div>

      <div class="combo-btn">
        <button
          type="button"
          onclick="WebAuthnClient.loginWithPasskey('conditional')"
          class="btn btn-secondary combo-btn-main"
        >
          Login with Passkey (conditional)
        </button>
        <button
          type="button"
          class="btn btn-secondary combo-btn-toggle"
          onclick="this.parentElement.classList.toggle('open')"
        >
          &#9662;
        </button>
        <div class="combo-btn-dropdown">
          <button
            type="button"
            onclick="window.location.href='/passkey-conditional'"
          >
            New page (conditional)
          </button>
          <button
            type="button"
            onclick="WebAuthnClient.loginWithPasskey(undefined)"
          >
            undefined
          </button>
          <button
            type="button"
            onclick="WebAuthnClient.loginWithPasskey('optional')"
          >
            Optional
          </button>
          <button
            type="button"
            onclick="WebAuthnClient.loginWithPasskey('required')"
          >
            Required
          </button>
          <button
            type="button"
            onclick="WebAuthnClient.loginWithPasskey('silent')"
          >
            Silent
          </button>
        </div>
      </div>

      <p class="auth-link">
        Don't have an account? <a href="/register">Register</a>
      </p>
    </AuthCard>
    <script src="/js/login.js" />
  </Layout>
);
