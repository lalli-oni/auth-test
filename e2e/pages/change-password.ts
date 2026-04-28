import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { ROUTES } from '../constants';
import { SHARED } from '../selectors/shared';
import { CHANGE_PASSWORD } from '../selectors/change-password';

export const changePasswordPage = {
  async goto(page: Page, options?: { noCurrent?: boolean; withConfirmation?: boolean }) {
    const params = new URLSearchParams();
    if (options?.noCurrent) params.set('no_current', '1');
    if (options?.withConfirmation) params.set('with_confirmation', '1');
    const qs = params.toString();
    await page.goto(qs ? `${ROUTES.CHANGE_PASSWORD}?${qs}` : ROUTES.CHANGE_PASSWORD);
  },

  async fillCurrentPassword(page: Page, password: string) {
    await page.fill(CHANGE_PASSWORD.CURRENT_PASSWORD, password);
  },

  async fillNewPassword(page: Page, password: string) {
    await page.fill(CHANGE_PASSWORD.NEW_PASSWORD, password);
  },

  async fillConfirmNewPassword(page: Page, password: string) {
    await page.fill(CHANGE_PASSWORD.CONFIRM_NEW_PASSWORD, password);
  },

  async submit(page: Page) {
    await page.click(CHANGE_PASSWORD.SUBMIT_BTN);
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
