export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  LOGIN_MULTI_STEP: '/login/multi-step',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  CHANGE_PASSWORD: '/auth/change-password',
  MFA_VERIFY: '/mfa/verify',
  PASSKEY_CONDITIONAL: '/passkey-conditional',
  LOGOUT: '/auth/logout',
  AUTH_STATUS: '/auth/status',
  MFA_STATUS: '/auth/mfa-status',
} as const;

export const ADMIN_ROUTES = {
  USERS: '/admin/users',
  USER: (id: number) => `/admin/users/${id}`,
  RESET_PASSWORD: (id: number) => `/admin/users/${id}/reset-password`,
  TOTP_CURRENT: (id: number) => `/admin/users/${id}/totp/current`,
  TOTP_DISABLE: (id: number) => `/admin/users/${id}/totp`,
  EMAIL_CODES: (id: number) => `/admin/users/${id}/email-codes`,
  USER_SESSIONS: (id: number) => `/admin/users/${id}/sessions`,
  USER_PASSKEYS: (id: number) => `/admin/users/${id}/passkeys`,
  SESSIONS: '/admin/sessions',
  EVENTS: '/admin/events',
  RESET_DB: '/admin/reset',
} as const;

export const MESSAGES = {
  // Login
  FIELDS_REQUIRED: 'Username and password are required',
  INVALID_CREDENTIALS: 'Invalid username or password',
  LOGIN_SUCCESS: 'Logged in successfully',

  // Register
  USERNAME_TAKEN: 'Username already taken',
  PASSWORDS_MISMATCH: 'Passwords do not match',
  REGISTER_SUCCESS: 'Account created successfully',

  // Change password
  WEAK_PASSWORD: 'New password must be at least 6 characters',
  CURRENT_PASSWORD_REQUIRED: 'Current password is required',
  CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',
  NEW_PASSWORDS_MISMATCH: 'New passwords do not match',
  PASSWORD_CHANGED: 'Password changed successfully',

  // MFA
  MFA_CODE_REQUIRED: 'Code is required',
  MFA_INVALID_CODE: 'Invalid code',
  MFA_INVALID_EMAIL_CODE: 'Invalid or expired code',
} as const;

export const TEST_DEFAULTS = {
  PASSWORD: 'TestPassword123!',
} as const;
