export const MFA_VERIFY = {
  // TOTP section
  TOTP_FORM: 'form[action="/mfa/totp/verify"]',
  TOTP_CODE: '#totp_code',
  TOTP_VERIFY_BTN: 'form[action="/mfa/totp/verify"] button[type="submit"]',

  // Email section
  EMAIL_SEND_FORM: 'form[action="/mfa/email/send"]',
  EMAIL_SEND_BTN: 'form[action="/mfa/email/send"] button[type="submit"]',
  EMAIL_VERIFY_FORM: 'form[action="/mfa/email/verify"]',
  EMAIL_CODE: '#email_code',
  EMAIL_VERIFY_BTN: 'form[action="/mfa/email/verify"] button[type="submit"]',

  // Cancel / Logout
  LOGOUT_FORM: 'form[action="/auth/logout"]',
  CANCEL_BTN: 'form[action="/auth/logout"] button',
} as const;
