import type { FC } from 'hono/jsx';
import { getVariantById, getVariantsByGroup } from '../../config/variants';
import {
  Alert,
  AuthCard,
  ComboButton,
  FormGroup,
  PasswordInput,
  VariantCheckbox,
} from '../components';
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
  useFetch?: boolean;
  stayOnPage?: boolean;
  redirectToLogin?: boolean;
}

export const LoginPage: FC<LoginPageProps> = ({
  error,
  success,
  useFetch,
  stayOnPage,
  redirectToLogin,
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
          <PasswordInput
            id="password"
            name="password"
            autocomplete="current-password"
            required
          />
        </FormGroup>

        <div class="form-group">
          <label id="mfa-label" title={getVariantById('require-2fa')?.tooltip}>
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

        <VariantCheckbox variantId="use-fetch" checked={useFetch} />
        <VariantCheckbox variantId="stay-on-page" checked={stayOnPage} />
        <VariantCheckbox
          variantId="redirect-to-login"
          checked={redirectToLogin}
        />

        <div class="combo-btn">
          <button type="submit" class="btn btn-primary combo-btn-main">
            Login
          </button>
          <button
            type="button"
            class="btn btn-primary combo-btn-toggle"
            onclick="this.parentElement.classList.toggle('open')"
          >
            &#9662;
          </button>
          <div class="combo-btn-dropdown">
            <a
              href="/login/multi-step"
              title={getVariantById('multi-step-login')?.tooltip}
            >
              Multi-step login
            </a>
          </div>
        </div>
      </form>

      <div class="auth-divider">
        <span>or</span>
      </div>

      <ComboButton
        primaryLabel={`Login with Passkey (${primaryPasskey.label.toLowerCase()})`}
        primaryOnclick={passkeyOnclick(primaryPasskey.id)}
        primaryTitle={primaryPasskey.tooltip}
        btnStyle="btn-secondary"
      >
        {secondaryPasskeys.map((v) => (
          <button
            type="button"
            onclick={passkeyOnclick(v.id)}
            title={v.tooltip}
          >
            {v.label}
          </button>
        ))}
      </ComboButton>

      <p class="auth-link">
        Don't have an account? <a href="/register">Register</a>
      </p>
    </AuthCard>
    <script src="/js/login.js" />
    <script src="/js/password-toggle.js" />
    <script src="/js/form-submit.js" />
  </Layout>
);
