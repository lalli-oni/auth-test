import type { FC } from 'hono/jsx';
import { Alert, AuthCard, FormGroup, PasswordInput } from '../components';
import { Layout } from '../layout';

export interface RegisterPageProps {
  error?: string;
}

export const RegisterPage: FC<RegisterPageProps> = ({ error }) => (
  <Layout title="Register">
    <AuthCard title="Create Account">
      <Alert error={error} />

      <form action="/auth/register" method="post" class="auth-form">
        <FormGroup label="Username" htmlFor="username">
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
        </FormGroup>

        <FormGroup label="Email (optional)" htmlFor="email">
          <input type="email" id="email" name="email" autocomplete="email" />
        </FormGroup>

        <FormGroup label="Password" htmlFor="password">
          <PasswordInput
            id="password"
            name="password"
            autocomplete="new-password"
            required
            minlength={6}
          />
        </FormGroup>

        <FormGroup label="Confirm Password" htmlFor="confirm_password">
          <PasswordInput
            id="confirm_password"
            name="confirm_password"
            autocomplete="new-password"
            required
          />
        </FormGroup>

        <button type="submit" class="btn btn-primary">
          Create Account
        </button>
      </form>

      <p class="auth-link">
        Already have an account? <a href="/login">Login</a>
      </p>
    </AuthCard>
    <script src="/js/password-toggle.js" />
  </Layout>
);
