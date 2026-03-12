import type { FC } from 'hono/jsx';
import { getVariantById } from '../../config/variants';
import type { User } from '../../services/user.service';
import { Alert, AuthCard, FormGroup, PasswordInput } from '../components';
import { Layout } from '../layout';

export interface ChangePasswordOptions {
  noCurrent?: boolean;
  withConfirmation?: boolean;
}

export interface ChangePasswordPageProps {
  user: User;
  options?: ChangePasswordOptions;
  stayOnPage?: boolean;
  error?: string;
  success?: string;
}

export const ChangePasswordPage: FC<ChangePasswordPageProps> = ({
  user,
  options,
  stayOnPage,
  error,
  success,
}) => (
  <Layout title="Change Password" user={user}>
    <AuthCard title="Change Password">
      <Alert error={error} success={success} />

      <form action="/auth/change-password" method="post">
        <input
          type="text"
          name="username"
          autocomplete="username"
          value={user.username}
          readonly
          tabindex={-1}
          style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden"
        />
        {options?.noCurrent && (
          <input type="hidden" name="no_current" value="1" />
        )}
        {options?.withConfirmation && (
          <input type="hidden" name="with_confirmation" value="1" />
        )}

        {!options?.noCurrent && (
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

        {options?.withConfirmation && (
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
          Change Password
        </button>
      </form>

      <p class="auth-link">
        <a href="/dashboard">&larr; Back to Dashboard</a>
      </p>
    </AuthCard>

    <script src="/js/password-toggle.js" />
    <script src="/js/stay-on-page.js" />
  </Layout>
);
