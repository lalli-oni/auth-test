import { test, expect } from '../fixtures';
import { loginPage } from '../pages';
import { MESSAGES } from '../constants';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await loginPage.goto(page);
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('form[action="/auth/login"] .combo-btn-main')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page, testUser }) => {
    await loginPage.fillAndSubmit(page, testUser.username, testUser.password);
    await loginPage.expectRedirectToDashboard(page);
  });

  test('should show error for invalid credentials', async ({ page, testUser }) => {
    await loginPage.fillAndSubmit(page, testUser.username, 'wrongpassword');
    await loginPage.expectError(page, MESSAGES.INVALID_CREDENTIALS);
  });

  test('should show error for nonexistent user', async ({ page }) => {
    await loginPage.fillAndSubmit(page, 'nonexistent_user', 'somepassword');
    await loginPage.expectError(page, MESSAGES.INVALID_CREDENTIALS);
  });

  test('should toggle password visibility', async ({ page }) => {
    await loginPage.fillPassword(page, 'secret');
    const input = page.locator('#password');
    await expect(input).toHaveAttribute('type', 'password');
    await loginPage.togglePassword(page);
    await expect(input).toHaveAttribute('type', 'text');
    await loginPage.togglePassword(page);
    await expect(input).toHaveAttribute('type', 'password');
  });

  test('should navigate to multi-step login via combo dropdown', async ({ page }) => {
    await loginPage.clickMultiStepLink(page);
    await expect(page).toHaveURL(/\/login\/multi-step/);
  });

  test('should navigate to register page', async ({ page }) => {
    await page.click('a[href="/register"]');
    await expect(page).toHaveURL(/\/register/);
  });
});
