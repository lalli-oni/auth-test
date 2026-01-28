import { layout } from "../layout";
import type { User } from "../../services/user.service";

export interface MfaVerifyPageOptions {
  user: User;
  error?: string;
}

export function mfaVerifyPage(options: MfaVerifyPageOptions): string {
  const { user, error } = options;

  const showTotp = user.totp_enabled;
  const showEmail = user.email_mfa_enabled;

  const content = `
    <div class="auth-form-container">
      <h2>Two-Factor Authentication</h2>
      <p>Additional verification is required to complete login.</p>

      ${error ? `<div class="alert alert-error">${error}</div>` : ""}

      ${
        showTotp
          ? `
        <div class="mfa-option">
          <h3>Authenticator App</h3>
          <p>Enter the 6-digit code from your authenticator app.</p>
          <form action="/mfa/totp/verify" method="POST" class="auth-form">
            <div class="form-group">
              <label for="totp_code">TOTP Code</label>
              <input
                type="text"
                id="totp_code"
                name="code"
                autocomplete="one-time-code"
                inputmode="numeric"
                pattern="[0-9]{6}"
                maxlength="6"
                required
                autofocus
                placeholder="000000"
              />
            </div>
            <button type="submit" class="btn btn-primary">Verify</button>
          </form>
        </div>
      `
          : ""
      }

      ${showTotp && showEmail ? '<div class="auth-divider"><span>or</span></div>' : ""}

      ${
        showEmail
          ? `
        <div class="mfa-option">
          <h3>Email Code</h3>
          <p>We'll send a verification code to your email.</p>
          <form action="/mfa/email/send" method="POST" class="inline-form">
            <button type="submit" class="btn btn-secondary">Send Code</button>
          </form>
          <form action="/mfa/email/verify" method="POST" class="auth-form" style="margin-top: 1rem;">
            <div class="form-group">
              <label for="email_code">Email Code</label>
              <input
                type="text"
                id="email_code"
                name="code"
                autocomplete="one-time-code"
                inputmode="numeric"
                pattern="[0-9]{6}"
                maxlength="6"
                required
                placeholder="000000"
              />
            </div>
            <button type="submit" class="btn btn-primary">Verify</button>
          </form>
        </div>
      `
          : ""
      }

      <div class="mfa-cancel">
        <form action="/auth/logout" method="POST">
          <button type="submit" class="btn-link">Cancel and Logout</button>
        </form>
      </div>
    </div>
  `;

  return layout(content, { title: "Verify MFA", user });
}
