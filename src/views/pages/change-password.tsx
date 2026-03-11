import type { FC } from 'hono/jsx';
import type { User } from '../../services/user.service';
import { Alert, AuthCard, FormGroup, PasswordInput } from '../components';
import { Layout } from '../layout';

export type ChangePasswordVariant = 'no-current' | 'with-confirmation';

export interface ChangePasswordPageProps {
  user: User;
  variant?: ChangePasswordVariant;
  stayOnPage?: boolean;
  error?: string;
  success?: string;
}

export const ChangePasswordPage: FC<ChangePasswordPageProps> = ({
  user,
  variant,
  stayOnPage,
  error,
  success,
}) => (
  <Layout title="Change Password" user={user}>
    <AuthCard title="Change Password">
      <Alert error={error} success={success} />

      <form action="/auth/change-password" method="post">
        <input
          type="hidden"
          name="username"
          autocomplete="username"
          value={user.username}
        />
        {variant && <input type="hidden" name="variant" value={variant} />}

        {variant !== 'no-current' && (
          <FormGroup label="Current Password" htmlFor="current_password">
            <PasswordInput
              id="current_password"
              name="current_password"
              autocomplete="current-password"
              required
            />
          </FormGroup>
        )}

        <FormGroup label="New Password" htmlFor="new_password">
          <PasswordInput
            id="new_password"
            name="new_password"
            autocomplete="new-password"
            required
            minlength={6}
          />
        </FormGroup>

        {variant === 'with-confirmation' && (
          <FormGroup
            label="Confirm New Password"
            htmlFor="confirm_new_password"
          >
            <PasswordInput
              id="confirm_new_password"
              name="confirm_new_password"
              autocomplete="new-password"
              required
              minlength={6}
            />
          </FormGroup>
        )}

        <div class="form-group">
          <label class="checkbox-label">
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
          Change Password
        </button>
      </form>

      <p class="auth-link">
        <a href="/dashboard">&larr; Back to Dashboard</a>
      </p>
    </AuthCard>

    <script src="/js/password-toggle.js" />
  </Layout>
);
