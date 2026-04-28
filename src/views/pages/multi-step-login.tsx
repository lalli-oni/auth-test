import type { FC } from 'hono/jsx';
import { getVariantById } from '../../config/variants';
import {
  Alert,
  AuthCard,
  FormGroup,
  PasswordInput,
  VariantCheckbox,
} from '../components';
import { Layout } from '../layout';

export interface MultiStepLoginPageProps {
  error?: string;
  success?: string;
  username?: string;
  useFetch?: boolean;
  stayOnPage?: boolean;
  redirectToLogin?: boolean;
}

export const MultiStepLoginPage: FC<MultiStepLoginPageProps> = ({
  error,
  success,
  username,
  useFetch,
  stayOnPage,
  redirectToLogin,
}) => (
  <Layout title="Multi-Step Login">
    <AuthCard title="Multi-Step Login">
      <Alert error={error} success={success} />

      <form action="/auth/login" method="post" class="auth-form">
        <input type="hidden" name="source" value="multi-step" />

        <div id="step-1" class="login-step">
          <FormGroup label="Username" htmlFor="username">
            <input
              type="text"
              id="username"
              name="username"
              autocomplete="username"
              required
              autofocus
              value={username}
            />
          </FormGroup>

          <button type="button" id="continue-btn" class="btn btn-primary">
            Continue
          </button>
        </div>

        <div id="step-2" class="login-step" style="display:none">
          <div id="identity-display" style="display:none" />

          <FormGroup label="Password" htmlFor="password">
            <PasswordInput
              id="password"
              name="password"
              autocomplete="current-password"
              required
            />
          </FormGroup>

          <div class="form-group">
            <label
              id="mfa-label"
              title={getVariantById('require-2fa')?.tooltip}
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

          <button type="button" id="back-btn">
            &larr; Back
          </button>
        </div>

        <VariantCheckbox variantId="clear-fields" />
        <VariantCheckbox variantId="use-fetch" checked={useFetch} />
        <VariantCheckbox variantId="stay-on-page" checked={stayOnPage} />
        <VariantCheckbox
          variantId="redirect-to-login"
          checked={redirectToLogin}
        />
      </form>

      <p class="auth-link">
        Or use the <a href="/login">standard login</a>
      </p>
    </AuthCard>
    <script src="/js/login.js" />
    <script src="/js/password-toggle.js" />
    <script src="/js/form-submit.js" />
    <script src="/js/multi-step-login.js" />
  </Layout>
);
