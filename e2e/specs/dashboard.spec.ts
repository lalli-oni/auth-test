import { test, expect } from '../fixtures';
import { loginPage, dashboardPage } from '../pages';



test.describe('Dashboard', () => {
  test.beforeEach(async ({ page, testUser }) => {
    await loginPage.goto(page);
    await loginPage.fillAndSubmit(page, testUser.username, testUser.password);
    await loginPage.expectRedirectToDashboard(page);
  });

  test('should display dashboard after login', async ({ page }) => {
    await dashboardPage.expectLoaded(page);
  });

  test('should show correct username', async ({ page, testUser }) => {
    const username = await dashboardPage.getUsername(page);
    expect(username).toContain(testUser.username);
  });

  test('should navigate to change password', async ({ page }) => {
    await dashboardPage.clickChangePassword(page);
    await expect(page).toHaveURL(/\/change-password/);
  });

  test('should logout successfully', async ({ page }) => {
    await dashboardPage.logout(page);
    await expect(page).toHaveURL(/\/login/);
  });
});
