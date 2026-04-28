import { test, expect } from '../fixtures';
import { changePasswordPage } from '../pages';
import { loginPage } from '../pages';
import { MESSAGES } from '../constants';

test.describe('Change Password', () => {
  // NOTE: change-password requires an authenticated session with MFA verified.
  // Tests must first log in via loginPage, then navigate.

  test('should change password with current password', async ({ page, testUser }) => {
    // TODO: login, goto change-password, fill current + new, submit, expect success
  });

  test('should show error for wrong current password', async ({ page, testUser }) => {
    // TODO: login, fill wrong current password, expect MESSAGES.CURRENT_PASSWORD_INCORRECT
  });

  test('should show error for weak new password', async ({ page, testUser }) => {
    // TODO: login, fill short new password, expect MESSAGES.WEAK_PASSWORD
  });

  test('should change password with skip-current variant', async ({ page, testUser }) => {
    // TODO: login, goto change-password?no_current=1, fill only new password, expect success
  });

  test('should change password with confirmation variant', async ({ page, testUser }) => {
    // TODO: login, goto change-password?with_confirmation=1, fill all fields, expect success
  });

  test('should show error for mismatched confirmation', async ({ page, testUser }) => {
    // TODO: login, goto with confirmation, fill mismatched, expect MESSAGES.NEW_PASSWORDS_MISMATCH
  });
});
