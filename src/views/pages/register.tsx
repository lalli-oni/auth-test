import type { FC } from 'hono/jsx';
import { getVariantById } from '../../config/variants';
import { Alert, AuthCard, FormGroup, PasswordInput } from '../components';
import { Layout } from '../layout';

export interface RegisterPageProps {
  error?: string;
  success?: string;
  stayOnPage?: boolean;
}

export const RegisterPage: FC<RegisterPageProps> = ({
  error,
  success,
  stayOnPage,
}) => (
  <Layout title="Register">
    <AuthCard title="Create Account">
      <Alert error={error} success={success} />

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

        <div class="form-group">
          <label
            class="checkbox-label"
            title={getVariantById('stay-on-page')?.tooltip}
          >
            <input
              type="checkbox"
              name="stay_on_page"
              value="1"
              checked={stayOnPage}
            />
            Stay on page after success
          </label>
        </div>

        <button type="submit" class="btn btn-primary">
          Create Account
        </button>
      </form>

      <p class="auth-link">
        Already have an account? <a href="/login">Login</a>
      </p>
    </AuthCard>
    <script src="/js/password-toggle.js" />
    <script src="/js/stay-on-page.js" />
  </Layout>
);
