import { test, expect } from '../fixtures';
import { loginPage } from '../pages';
import { mfaVerifyPage } from '../pages';
import { adminApi } from '../fixtures';
import { MESSAGES } from '../constants';

test.describe('MFA Verification', () => {
  // NOTE: MFA tests require a user with TOTP or email MFA enabled.
  // Use adminApi to enable MFA and retrieve codes.

  test('should verify with valid TOTP code', async ({ page, testUser, request }) => {
    // TODO: enable TOTP for testUser via admin, login with 2FA, get code via adminApi, submit
  });

  test('should show error for invalid TOTP code', async ({ page, testUser, request }) => {
    // TODO: enable TOTP, login with 2FA, submit wrong code, expect MESSAGES.MFA_INVALID_CODE
  });

  test('should verify with email code', async ({ page, testUser, request }) => {
    // TODO: enable email MFA, login with 2FA, generate code via adminApi, submit
  });

  test('should show error for invalid email code', async ({ page, testUser, request }) => {
    // TODO: enable email MFA, login with 2FA, submit wrong code, expect MESSAGES.MFA_INVALID_EMAIL_CODE
  });

  test('should cancel and logout', async ({ page, testUser }) => {
    // TODO: login with 2FA, click cancel, expect redirect to login
  });
});
