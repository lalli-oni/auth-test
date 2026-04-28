import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { ROUTES } from '../constants';
import { DASHBOARD } from '../selectors/dashboard';

export const dashboardPage = {
  async goto(page: Page) {
    await page.goto(ROUTES.DASHBOARD);
  },

  async expectLoaded(page: Page) {
    await expect(page.locator(DASHBOARD.CONTAINER)).toBeVisible();
  },

  async getUsername(page: Page): Promise<string> {
    return (await page.locator(DASHBOARD.INFO_USERNAME).textContent()) ?? '';
  },

  async clickSetupTotp(page: Page) {
    await page.click(DASHBOARD.TOTP_ENABLE_BTN);
  },

  async getTotpSecret(page: Page): Promise<string> {
    return (await page.locator(DASHBOARD.TOTP_SECRET).textContent()) ?? '';
  },

  async fillTotpVerifyCode(page: Page, code: string) {
    await page.fill(DASHBOARD.TOTP_VERIFY_INPUT, code);
  },

  async submitTotpVerify(page: Page) {
    await page.click(DASHBOARD.TOTP_VERIFY_BTN);
  },

  async clickChangePassword(page: Page) {
    await page.click(DASHBOARD.CHANGE_PASSWORD_LINK);
  },

  async logout(page: Page) {
    await page.click(DASHBOARD.LOGOUT_BTN);
  },

  async expectRedirectToLogin(page: Page) {
    await page.waitForURL('**/login**');
  },
};
