import { test, expect } from '../fixtures';
import { registerPage } from '../pages';
import { adminApi } from '../fixtures';
import { MESSAGES } from '../constants';

test.describe('Register', () => {
  test.beforeEach(async ({ page }) => {
    await registerPage.goto(page);
  });

  test('should display registration form', async ({ page }) => {
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirm_password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should register successfully', async ({ page, request }) => {
    const username = `reg_${Date.now()}`;
    await registerPage.fillAndSubmit(page, username, 'StrongPass123!');
    await registerPage.expectRedirectToDashboard(page);

    // Clean up the created user
    const resp = await request.get('/admin/users');
    const { users } = await resp.json();
    const created = users.find((u: { username: string }) => u.username === username);
    if (created) await adminApi.deleteUser(request, created.id);
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

    // Clean up
    const resp = await request.get('/admin/users');
    const { users } = await resp.json();
    const created = users.find((u: { username: string }) => u.username === username);
    if (created) await adminApi.deleteUser(request, created.id);
  });
});
