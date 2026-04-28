import { test, expect } from '../fixtures';
import { loginPage, mfaVerifyPage } from '../pages';
import { adminApi } from '../fixtures';
import { MESSAGES } from '../constants';

test.describe('MFA Verification', () => {
  // MFA tests require users with TOTP/email MFA enabled.
  // Enabling TOTP requires the dashboard setup flow (QR scan + code verify),
  // which is complex to automate without the full TOTP secret.
  // These tests are scaffolded for when admin API supports direct TOTP enablement.

  test.skip('should verify with valid TOTP code', async ({ page, testUser, request }) => {
    // TODO: enable TOTP for testUser, login with 2FA, get code via adminApi, submit
  });

  test.skip('should show error for invalid TOTP code', async ({ page, testUser, request }) => {
    // TODO: enable TOTP, login with 2FA, submit wrong code
  });

  test.skip('should verify with email code', async ({ page, testUser, request }) => {
    // TODO: enable email MFA, login with 2FA, generate code via adminApi, submit
  });

  test.skip('should show error for invalid email code', async ({ page, testUser, request }) => {
    // TODO: enable email MFA, login with 2FA, submit wrong code
  });

  test.skip('should cancel and logout', async ({ page, testUser }) => {
    // TODO: login with 2FA, click cancel, expect redirect to login
  });
});
