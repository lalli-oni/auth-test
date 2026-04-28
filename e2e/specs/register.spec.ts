import { test, expect } from '../fixtures';
import { registerPage } from '../pages';
import { REGISTER } from '../selectors/register';
import { adminApi } from '../fixtures';
import { MESSAGES } from '../constants';

async function cleanupRegisteredUser(request: Parameters<typeof adminApi.deleteUser>[0], username: string) {
  try {
    const resp = await request.get('/admin/users');
    const { users } = await resp.json();
    const created = users.find((u: { username: string }) => u.username === username);
    if (created) {
      await adminApi.deleteUser(request, created.id);
    } else {
      console.warn(`[register cleanup] Could not find user "${username}" for cleanup`);
    }
  } catch (error) {
    console.warn(`[register cleanup] Failed to clean up user "${username}":`, error);
  }
}

test.describe('Register', () => {
  test.beforeEach(async ({ page }) => {
    await registerPage.goto(page);
  });

  test('should display registration form', async ({ page }) => {
    await expect(page.locator(REGISTER.USERNAME)).toBeVisible();
    await expect(page.locator(REGISTER.EMAIL)).toBeVisible();
    await expect(page.locator(REGISTER.PASSWORD)).toBeVisible();
    await expect(page.locator(REGISTER.CONFIRM_PASSWORD)).toBeVisible();
    await expect(page.locator(REGISTER.SUBMIT_BTN)).toBeVisible();
  });

  test('should register successfully', async ({ page, request }) => {
    const username = `reg_${Date.now()}`;
    await registerPage.fillAndSubmit(page, username, 'StrongPass123!');
    await registerPage.expectRedirectToDashboard(page);
    await cleanupRegisteredUser(request, username);
  });

  test('should show error for duplicate username', async ({ page, testUser }) => {
    await registerPage.fillAndSubmit(page, testUser.username, 'AnotherPass123!');
    await registerPage.expectError(page, MESSAGES.USERNAME_TAKEN);
  });

  test('should show error for password mismatch', async ({ page }) => {
    await registerPage.fillUsername(page, `mismatch_${Date.now()}`);
    await registerPage.fillPassword(page, 'Password123!');
    await registerPage.fillConfirmPassword(page, 'Different456!');
    await registerPage.submit(page);
    await registerPage.expectError(page, MESSAGES.PASSWORDS_MISMATCH);
  });

  test('should register without email', async ({ page, request }) => {
    const username = `noemail_${Date.now()}`;
    await registerPage.fillUsername(page, username);
    await registerPage.fillPassword(page, 'StrongPass123!');
    await registerPage.fillConfirmPassword(page, 'StrongPass123!');
    await registerPage.submit(page);
    await registerPage.expectRedirectToDashboard(page);
    await cleanupRegisteredUser(request, username);
  });
});
