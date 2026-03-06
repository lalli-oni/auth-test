import type { FC } from 'hono/jsx';
import type { Session } from '../../services/session.service';
import type { User } from '../../services/user.service';
import type { PasskeyCredential } from '../../services/webauthn.service';
import { Alert } from '../components';
import { Layout } from '../layout';

export interface DashboardPageProps {
  user: User;
  session: Session;
  passkeys: PasskeyCredential[];
  success?: string;
  error?: string;
}

const PasskeyItem: FC<{ passkey: PasskeyCredential }> = ({ passkey }) => (
  <div class="passkey-item">
    <div class="passkey-info">
      <strong>{passkey.friendly_name || 'Unnamed Passkey'}</strong>
      <span class="passkey-meta">
        Created: {new Date(passkey.created_at).toLocaleString()}
        {passkey.backed_up && ' \u2022 Backed up'}
      </span>
    </div>
    <button
      type="button"
      onclick={`deletePasskey('${passkey.id}')`}
      class="btn btn-danger btn-small"
    >
      Remove
    </button>
  </div>
);

export const DashboardPage: FC<DashboardPageProps> = ({
  user,
  session,
  passkeys,
  success,
  error,
}) => (
  <Layout title="Dashboard" user={user}>
    <div class="dashboard">
      <h2>Dashboard</h2>

      <Alert error={error} success={success} />

      <div class="dashboard-section">
        <h3>Account Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Username</label>
            <span>{user.username}</span>
          </div>
          <div class="info-item">
            <label>Email</label>
            <span>{user.email || 'Not set'}</span>
          </div>
          <div class="info-item">
            <label>Account Created</label>
            <span>{new Date(user.created_at).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div class="dashboard-section">
        <h3>Security Settings</h3>

        <div class="security-option">
          <div class="security-option-info">
            <h4>TOTP Authenticator</h4>
            <p>
              Use an authenticator app like Google Authenticator or 1Password.
            </p>
            <span
              class={`status-badge ${user.totp_enabled ? 'status-enabled' : 'status-disabled'}`}
            >
              {user.totp_enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div class="security-option-actions">
            {user.totp_enabled ? (
              <form action="/mfa/totp/disable" method="post">
                <button type="submit" class="btn btn-danger btn-small">
                  Disable
                </button>
              </form>
            ) : (
              <button
                type="button"
                onclick="showTotpSetup()"
                class="btn btn-primary btn-small"
              >
                Enable
              </button>
            )}
          </div>
        </div>

        <div class="security-option">
          <div class="security-option-info">
            <h4>Email Codes</h4>
            <p>Receive verification codes via email.</p>
            <span
              class={`status-badge ${user.email_mfa_enabled ? 'status-enabled' : 'status-disabled'}`}
            >
              {user.email_mfa_enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div class="security-option-actions">
            {user.email_mfa_enabled ? (
              <form action="/mfa/email/disable" method="post">
                <button type="submit" class="btn btn-danger btn-small">
                  Disable
                </button>
              </form>
            ) : (
              <form action="/mfa/email/enable" method="post">
                <button type="submit" class="btn btn-primary btn-small">
                  Enable
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div class="dashboard-section">
        <h3>Passkeys</h3>
        <p>Passkeys let you sign in securely without a password.</p>

        {passkeys.length > 0 ? (
          <div class="passkey-list">
            {passkeys.map((pk) => (
              <PasskeyItem passkey={pk} />
            ))}
          </div>
        ) : (
          <p class="no-items">No passkeys registered.</p>
        )}

        <button
          type="button"
          onclick="WebAuthnClient.registerPasskey()"
          class="btn btn-primary"
        >
          Register New Passkey
        </button>
      </div>

      <div class="dashboard-section">
        <h3>Current Session</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Session ID</label>
            <span class="monospace">{session.id.substring(0, 16)}...</span>
          </div>
          <div class="info-item">
            <label>MFA Verified</label>
            <span>{session.mfa_verified ? 'Yes' : 'No'}</span>
          </div>
          <div class="info-item">
            <label>Expires</label>
            <span>{new Date(session.expires_at).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>

    {/* TOTP Setup Modal */}
    <div id="totp-setup-modal" class="modal hidden">
      <div class="modal-content">
        <span class="modal-close" onclick="closeTotpSetup()">
          &times;
        </span>
        <h3>Setup TOTP Authenticator</h3>
        <p id="totp-setup-loading">Loading...</p>
        <p id="totp-setup-error" class="error hidden"></p>
        <div id="totp-setup-form" class="hidden">
          <p>Scan this QR code with your authenticator app:</p>
          <img id="totp-qr-code" src="" alt="TOTP QR Code" class="qr-code" />
          <p class="secret-code">
            Manual entry code: <code id="totp-secret"></code>
          </p>
          <form id="totp-verify-form">
            <div class="form-group">
              <label for="verify_code">
                Enter the 6-digit code from your app:
              </label>
              <input
                type="text"
                id="verify_code"
                pattern="[0-9]{6}"
                maxlength={6}
                required
              />
            </div>
            <button type="submit" class="btn btn-primary">
              Verify &amp; Enable
            </button>
          </form>
        </div>
      </div>
    </div>

    <script src="/js/dashboard.js"></script>
  </Layout>
);
