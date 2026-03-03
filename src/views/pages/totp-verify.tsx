import type { FC } from 'hono/jsx';
import { Layout } from '../layout';

export interface TotpVerifyPageProps {
  qrCodeDataUrl: string;
  otpauthUrl: string;
  secret: string;
  error?: string;
}

export const TotpVerifyPage: FC<TotpVerifyPageProps> = ({
  qrCodeDataUrl,
  otpauthUrl,
  secret,
  error,
}) => (
  <Layout title="Set Up Two-Factor Authentication">
    <div class="auth-form-container">
      <h2>Set Up Two-Factor Authentication</h2>
      <p>
        Scan the QR code with your password manager or authenticator app, or
        copy the setup key or URL manually.
      </p>

      {error && <div class="alert alert-error">{error}</div>}

      <div class="totp-setup">
        <img src={qrCodeDataUrl} alt="TOTP QR Code" class="qr-code" />

        <div class="totp-manual-entry">
          <p>
            <strong>Setup key:</strong>
          </p>
          <code class="totp-secret">{secret}</code>

          <p>
            <strong>Setup URL (paste into password manager):</strong>
          </p>
          <code class="totp-url">{otpauthUrl}</code>
        </div>
      </div>

      <form action="/mfa/totp-verify" method="post" class="auth-form">
        <div class="form-group">
          <label for="code">
            Enter the 6-digit code from your app to confirm setup:
          </label>
          <input
            type="text"
            id="code"
            name="code"
            inputmode="numeric"
            autocomplete="one-time-code"
            pattern="[0-9]{6}"
            maxlength={6}
            required
            autofocus
            placeholder="000000"
          />
        </div>
        <button type="submit" class="btn btn-primary">
          Verify &amp; Continue
        </button>
      </form>

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
