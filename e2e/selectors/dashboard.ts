export const DASHBOARD = {
  CONTAINER: '.dashboard',

  // Account info
  INFO_USERNAME: '.info-item:has(label:has-text("Username")) span',
  INFO_EMAIL: '.info-item:has(label:has-text("Email")) span',

  // TOTP
  TOTP_STATUS_BADGE:
    '.security-option:has(h4:has-text("TOTP")) .status-badge',
  TOTP_ENABLE_BTN: 'button[onclick="showTotpSetup()"]',
  TOTP_DISABLE_FORM: 'form[action="/mfa/totp/disable"]',
  TOTP_DISABLE_BTN: 'form[action="/mfa/totp/disable"] button',

  // TOTP setup modal
  TOTP_SETUP_MODAL: '#totp-setup-modal',
  TOTP_QR_CODE: '#totp-qr-code',
  TOTP_SECRET: '#totp-secret',
  TOTP_VERIFY_FORM: '#totp-verify-form',
  TOTP_VERIFY_INPUT: '#verify_code',
  TOTP_VERIFY_BTN: '#totp-verify-form button[type="submit"]',

  // Email MFA
  EMAIL_MFA_ENABLE_FORM: 'form[action="/mfa/email/enable"]',
  EMAIL_MFA_DISABLE_FORM: 'form[action="/mfa/email/disable"]',

  // Passkeys
  PASSKEY_REGISTER_BTN:
    'button[onclick*="WebAuthnClient.registerPasskey"]',
  PASSKEY_ITEM: '.passkey-item',
  PASSKEY_DELETE_BTN: '.passkey-item button.btn-danger',

  // Change password
  CHANGE_PASSWORD_LINK: '#change-password-link',
  CP_OPTION_SKIP_CURRENT: '[data-cp-option="no_current"]',
  CP_OPTION_CONFIRMATION: '[data-cp-option="with_confirmation"]',

  // Logout
  LOGOUT_FORM: 'form[action="/auth/logout"]',
  LOGOUT_BTN: 'form[action="/auth/logout"] button',
} as const;
