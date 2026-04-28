import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { ROUTES } from '../constants';
import { SHARED } from '../selectors/shared';
import { REGISTER } from '../selectors/register';

export const registerPage = {
  async goto(page: Page) {
    await page.goto(ROUTES.REGISTER);
  },

  async fillUsername(page: Page, username: string) {
    await page.fill(REGISTER.USERNAME, username);
  },

  async fillEmail(page: Page, email: string) {
    await page.fill(REGISTER.EMAIL, email);
  },

  async fillPassword(page: Page, password: string) {
    await page.fill(REGISTER.PASSWORD, password);
  },

  async fillConfirmPassword(page: Page, password: string) {
    await page.fill(REGISTER.CONFIRM_PASSWORD, password);
  },

  async submit(page: Page) {
    await page.click(REGISTER.SUBMIT_BTN);
  },

  async fillAndSubmit(page: Page, username: string, password: string, email?: string) {
    await this.fillUsername(page, username);
    if (email) await this.fillEmail(page, email);
    await this.fillPassword(page, password);
    await this.fillConfirmPassword(page, password);
    await this.submit(page);
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
};
