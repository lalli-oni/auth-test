import type { FC } from 'hono/jsx';
import type { Session } from '../../services/session.service';
import type { User } from '../../services/user.service';
import type { PasskeyCredential } from '../../services/webauthn.service';
import { Layout } from '../layout';

export interface DashboardPageProps {
  user: User;
  session: Session;
  passkeys: PasskeyCredential[];
  message?: string;
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

const DashboardScript: FC = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: `
      async function showTotpSetup() {
        const modal = document.getElementById('totp-setup-modal');
        const content = document.getElementById('totp-setup-content');
        modal.classList.remove('hidden');

        try {
          const response = await fetch('/mfa/totp/setup', { method: 'POST' });
          const data = await response.json();

          if (data.success) {
            content.innerHTML = \`
              <p>Scan this QR code with your authenticator app:</p>
              <img src="\${data.qrCodeDataUrl}" alt="TOTP QR Code" class="qr-code" />
              <p class="secret-code">Manual entry code: <code>\${data.secret}</code></p>
              <form onsubmit="verifyTotpSetup(event)">
                <div class="form-group">
                  <label for="verify_code">Enter the 6-digit code from your app:</label>
                  <input type="text" id="verify_code" pattern="[0-9]{6}" maxlength="6" required />
                </div>
                <button type="submit" class="btn btn-primary">Verify & Enable</button>
              </form>
            \`;
          } else {
            content.innerHTML = '<p class="error">Failed to setup TOTP: ' + data.error + '</p>';
          }
        } catch (err) {
          content.innerHTML = '<p class="error">Error: ' + err.message + '</p>';
        }
      }

      function closeTotpSetup() {
        document.getElementById('totp-setup-modal').classList.add('hidden');
      }

      async function verifyTotpSetup(event) {
        event.preventDefault();
        const code = document.getElementById('verify_code').value;

        try {
          const response = await fetch('/mfa/totp/enable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          });
          const data = await response.json();

          if (data.success) {
            window.location.reload();
          } else {
            console.error('[DashboardScript] TOTP verification failed - Status:', data.error);
          }
        } catch (err) {
          console.error('[DashboardScript] Error during TOTP verification - Exception:', err.message);
        }
      }

      async function deletePasskey(credentialId) {
        if (!confirm('Are you sure you want to remove this passkey?')) return;

        try {
          const response = await fetch('/webauthn/credential/' + credentialId, {
            method: 'DELETE'
          });
          const data = await response.json();

          if (data.success) {
            window.location.reload();
          } else {
            console.error('[DashboardScript] Failed to remove passkey - Status:', data.error);
          }
        } catch (err) {
          console.error('[DashboardScript] Error removing passkey - Exception:', err.message);
        }
      }
    `,
    }}
  />
);

export const DashboardPage: FC<DashboardPageProps> = ({
  user,
  session,
  passkeys,
  message,
  error,
}) => (
  <Layout title="Dashboard" user={user}>
    <div class="dashboard">
      <h2>Dashboard</h2>

      {message && <div class="alert alert-success">{message}</div>}
      {error && <div class="alert alert-error">{error}</div>}

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
              <form action="/mfa/totp/disable" method="POST">
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
              <form action="/mfa/email/disable" method="POST">
                <button type="submit" class="btn btn-danger btn-small">
                  Disable
                </button>
              </form>
            ) : (
              <form action="/mfa/email/enable" method="POST">
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
        <div id="totp-setup-content">
          <p>Loading...</p>
        </div>
      </div>
    </div>

    <DashboardScript />
  </Layout>
);
