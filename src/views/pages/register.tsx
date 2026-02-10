import type { FC } from 'hono/jsx';
import { Layout } from '../layout';

export interface RegisterPageProps {
  error?: string;
}

export const RegisterPage: FC<RegisterPageProps> = ({ error }) => (
  <Layout title="Register">
    <div class="auth-form-container">
      <h2>Create Account</h2>

      {error && <div class="alert alert-error">{error}</div>}

      <form action="/auth/register" method="POST" class="auth-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            autocomplete="username"
            required
            autofocus
            minlength={3}
            maxlength={50}
          />
        </div>

        <div class="form-group">
          <label for="email">Email (optional)</label>
          <input type="email" id="email" name="email" autocomplete="email" />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            autocomplete="new-password"
            required
            minlength={6}
          />
        </div>

        <div class="form-group">
          <label for="confirm_password">Confirm Password</label>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            autocomplete="new-password"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary">
          Create Account
        </button>
      </form>

      <p class="auth-link">
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  </Layout>
);
