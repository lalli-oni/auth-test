import type { FC } from 'hono/jsx';
import type { User } from '../../services/user.service';
import { Alert, OtpInput } from '../components';
import { Layout } from '../layout';

export interface MfaVerifyPageProps {
  user: User;
  error?: string;
  message?: string;
}

export const MfaVerifyPage: FC<MfaVerifyPageProps> = ({
  user,
  error,
  message,
}) => {
  const showTotp = user.totp_enabled;
  const showEmail = user.email_mfa_enabled;

  return (
    <Layout title="Verify MFA" user={user}>
      <div class="auth-form-container">
        <h2>Two-Factor Authentication</h2>
        <p>Additional verification is required to complete login.</p>

        <Alert error={error} success={message} />

        {showTotp && (
          <div class="mfa-option">
            <h3>Authenticator App</h3>
            <p>Enter the 6-digit code from your authenticator app.</p>
            <form action="/mfa/totp/verify" method="post" class="auth-form">
              <div class="form-group">
                <label for="totp_code">TOTP Code</label>
                <OtpInput id="totp_code" name="code" autofocus />
              </div>
              <button type="submit" class="btn btn-primary">
                Verify
              </button>
            </form>
          </div>
        )}

        {showTotp && showEmail && (
          <div class="auth-divider">
            <span>or</span>
          </div>
        )}

        {showEmail && (
          <div class="mfa-option">
            <h3>Email Code</h3>
            <p>We'll send a verification code to your email.</p>
            <form action="/mfa/email/send" method="post" class="inline-form">
              <button type="submit" class="btn btn-secondary">
                Send Code
              </button>
            </form>
            <form
              action="/mfa/email/verify"
              method="post"
              class="auth-form"
              style={{ marginTop: '1rem' }}
            >
              <div class="form-group">
                <label for="email_code">Email Code</label>
                <OtpInput id="email_code" name="code" />
              </div>
              <button type="submit" class="btn btn-primary">
                Verify
              </button>
            </form>
          </div>
        )}

        <div class="mfa-cancel">
          <form action="/auth/logout" method="post">
            <button type="submit" class="btn-link">
              Cancel and Logout
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};
