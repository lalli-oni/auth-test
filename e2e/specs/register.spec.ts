import { test, expect } from '../fixtures';
import { registerPage } from '../pages';
import { MESSAGES } from '../constants';

test.describe('Register', () => {
  test.beforeEach(async ({ page }) => {
    await registerPage.goto(page);
  });

  test('should display registration form', async ({ page }) => {
    // TODO: verify form elements are visible
  });

  test('should register successfully', async ({ page }) => {
    // TODO: fill with unique username and matching passwords, expect dashboard
  });

  test('should show error for duplicate username', async ({ page, testUser }) => {
    // TODO: register with testUser.username, expect MESSAGES.USERNAME_TAKEN
  });

  test('should show error for password mismatch', async ({ page }) => {
    // TODO: fill with mismatched passwords, expect MESSAGES.PASSWORDS_MISMATCH
  });

  test('should show error for empty fields', async ({ page }) => {
    // TODO: submit empty form, expect error
  });

  test('should register without email', async ({ page }) => {
    // TODO: fill without email, expect success
  });
});
