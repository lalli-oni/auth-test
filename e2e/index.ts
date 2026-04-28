// Selectors (Layer 1) — zero dependencies, framework-agnostic
export { SHARED } from './selectors/shared';
export { LOGIN } from './selectors/login';
export { MULTI_STEP_LOGIN } from './selectors/multi-step-login';
export { REGISTER } from './selectors/register';
export { CHANGE_PASSWORD } from './selectors/change-password';
export { MFA_VERIFY } from './selectors/mfa-verify';
export { DASHBOARD } from './selectors/dashboard';
export { PASSKEY_CONDITIONAL } from './selectors/passkey-conditional';

// Page Objects (Layer 2) — Playwright dependency
export { loginPage } from './pages/login';
export { multiStepLoginPage } from './pages/multi-step-login';
export { registerPage } from './pages/register';
export { changePasswordPage } from './pages/change-password';
export { mfaVerifyPage } from './pages/mfa-verify';
export { dashboardPage } from './pages/dashboard';
export { passkeyConditionalPage } from './pages/passkey-conditional';

// Fixtures (Layer 3) — admin API + test fixtures
export { adminApi } from './fixtures/admin-api';
export { test, expect } from './fixtures/test-fixtures';

// Constants
export { ROUTES, ADMIN_ROUTES, MESSAGES, TEST_DEFAULTS } from './constants';

// Types
export type { CreateUserPayload, AdminUserCreated, AdminUser, TotpCodeResult, EmailCodeResult } from './fixtures/admin-api';
export type { TestFixtures } from './fixtures/test-fixtures';
