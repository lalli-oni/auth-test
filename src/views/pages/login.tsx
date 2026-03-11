import type { FC } from 'hono/jsx';
import { getVariantsByGroup } from '../../config/variants';
import { Alert, AuthCard, ComboButton, FormGroup } from '../components';
import { Layout } from '../layout';

const passkeyMediationVariants = getVariantsByGroup('passkey-mediation');
const primaryPasskey = passkeyMediationVariants[0]!;
const secondaryPasskeys = passkeyMediationVariants.slice(1);

function passkeyOnclick(variantId: string): string {
  if (variantId === 'conditional-page') {
    return "window.location.href='/passkey-conditional'";
  }
  const arg = variantId === 'undefined' ? 'undefined' : `'${variantId}'`;
  return `WebAuthnClient.loginWithPasskey(${arg})`;
}

export interface LoginPageProps {
  error?: string;
  success?: string;
  stayOnPage?: boolean;
}

export const LoginPage: FC<LoginPageProps> = ({
  error,
  success,
  stayOnPage,
}) => (
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
          Login
        </button>
      </form>

      <div class="auth-divider">
        <span>or</span>
      </div>

      <ComboButton
        primaryLabel={`Login with Passkey (${primaryPasskey.label.toLowerCase()})`}
        primaryOnclick={passkeyOnclick(primaryPasskey.id)}
        btnStyle="btn-secondary"
      >
        {secondaryPasskeys.map((v) => (
          <button type="button" onclick={passkeyOnclick(v.id)}>
            {v.label}
          </button>
        ))}
      </ComboButton>

      <p class="auth-link">
        Don't have an account? <a href="/register">Register</a>
      </p>
    </AuthCard>
    <script src="/js/login.js" />
  </Layout>
);
