import { test, expect } from '../fixtures';
import { loginPage } from '../pages';
import { dashboardPage } from '../pages';

test.describe('Dashboard', () => {
  // NOTE: dashboard requires an authenticated session.
  // Tests must first log in via loginPage.

  test('should display dashboard after login', async ({ page, testUser }) => {
    // TODO: login, expect dashboard loaded, expect username displayed
  });

  test('should show correct username', async ({ page, testUser }) => {
    // TODO: login, verify getUsername matches testUser.username
  });

  test('should navigate to change password', async ({ page, testUser }) => {
    // TODO: login, click change password link, verify URL
  });

  test('should logout successfully', async ({ page, testUser }) => {
    // TODO: login, click logout, expect redirect to login
  });
});
