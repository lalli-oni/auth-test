import type { FC } from 'hono/jsx';
import { Layout } from '../layout';

export interface LoginPageProps {
  error?: string;
  success?: string;
}

export const LoginPage: FC<LoginPageProps> = ({ error, success }) => (
  <Layout title="Login">
    <div class="auth-form-container">
      <h2>Login</h2>

      {error && <div class="alert alert-error">{error}</div>}
      {success && <div class="alert alert-success">{success}</div>}

      <form action="/auth/login" method="post" class="auth-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            autocomplete="username"
            required
            autofocus
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            autocomplete="current-password"
            required
          />
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
          Login with Passkey
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
    </div>
  </Layout>
);
