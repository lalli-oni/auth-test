import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { ROUTES } from '../constants';
import { SHARED } from '../selectors/shared';
import { LOGIN } from '../selectors/login';

export const loginPage = {
  async goto(page: Page) {
    await page.goto(ROUTES.LOGIN);
  },

  async fillUsername(page: Page, username: string) {
    await page.fill(LOGIN.USERNAME, username);
  },

  async fillPassword(page: Page, password: string) {
    await page.fill(LOGIN.PASSWORD, password);
  },

  async togglePassword(page: Page) {
    await page.locator(LOGIN.FORM).locator(SHARED.PASSWORD_TOGGLE).click();
  },

  async submit(page: Page) {
    await page.click(LOGIN.LOGIN_BTN);
  },

  async fillAndSubmit(page: Page, username: string, password: string) {
    await this.fillUsername(page, username);
    await this.fillPassword(page, password);
    await this.submit(page);
  },

  async checkVariant(page: Page, variant: 'use_fetch' | 'stay_on_page' | 'redirect_to_login') {
    await page.check(SHARED.variantCheckbox(variant));
  },

  async openComboDropdown(page: Page) {
    await page.click(LOGIN.COMBO_TOGGLE);
  },

  async clickMultiStepLink(page: Page) {
    await this.openComboDropdown(page);
    await page.click(LOGIN.MULTI_STEP_LINK);
  },

  async expectError(page: Page, message?: string) {
    const alert = page.locator(SHARED.ALERT_ERROR);
    await expect(alert).toBeVisible();
    if (message) await expect(alert).toContainText(message);
  },

  async expectSuccess(page: Page, message?: string) {
    const alert = page.locator(SHARED.ALERT_SUCCESS);
    await expect(alert).toBeVisible();
    if (message) await expect(alert).toContainText(message);
  },

  async expectRedirectToDashboard(page: Page) {
    await page.waitForURL(ROUTES.DASHBOARD);
  },

  async expectRedirectToMfaVerify(page: Page) {
    await page.waitForURL(ROUTES.MFA_VERIFY);
  },
};
