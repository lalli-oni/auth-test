import { test, expect } from '../fixtures';
import { loginPage, changePasswordPage } from '../pages';
import { MESSAGES } from '../constants';

test.describe('Change Password', () => {
  test.beforeEach(async ({ page, testUser }) => {
    // Login first — change-password requires authenticated session
    await loginPage.goto(page);
    await loginPage.fillAndSubmit(page, testUser.username, testUser.password);
    await loginPage.expectRedirectToDashboard(page);
  });

  test('should change password with current password', async ({ page, testUser }) => {
    await changePasswordPage.goto(page);
    await changePasswordPage.fillCurrentPassword(page, testUser.password);
    await changePasswordPage.fillNewPassword(page, 'NewPassword456!');
    await changePasswordPage.submit(page);
    await changePasswordPage.expectRedirectToDashboard(page);
  });

  test('should show error for wrong current password', async ({ page }) => {
    await changePasswordPage.goto(page);
    await changePasswordPage.fillCurrentPassword(page, 'wrongcurrent');
    await changePasswordPage.fillNewPassword(page, 'NewPassword456!');
    await changePasswordPage.submit(page);
    await changePasswordPage.expectError(page, MESSAGES.CURRENT_PASSWORD_INCORRECT);
  });

  test('should prevent short new password via browser validation', async ({ page, testUser }) => {
    await changePasswordPage.goto(page);
    await changePasswordPage.fillCurrentPassword(page, testUser.password);
    await changePasswordPage.fillNewPassword(page, 'short');
    await changePasswordPage.submit(page);
    // Browser's minlength validation prevents form submission — page stays on change-password
    await expect(page).toHaveURL(/\/change-password/);
  });

  test('should change password with skip-current variant', async ({ page }) => {
    await changePasswordPage.goto(page, { noCurrent: true });
    await changePasswordPage.fillNewPassword(page, 'NewPassword456!');
    await changePasswordPage.submit(page);
    await changePasswordPage.expectRedirectToDashboard(page);
  });

  test('should show error for mismatched confirmation', async ({ page, testUser }) => {
    await changePasswordPage.goto(page, { withConfirmation: true });
    await changePasswordPage.fillCurrentPassword(page, testUser.password);
    await changePasswordPage.fillNewPassword(page, 'NewPassword456!');
    await changePasswordPage.fillConfirmNewPassword(page, 'Different789!');
    await changePasswordPage.submit(page);
    await changePasswordPage.expectError(page, MESSAGES.NEW_PASSWORDS_MISMATCH);
  });
});
