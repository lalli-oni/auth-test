import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { ROUTES } from '../constants';
import { SHARED } from '../selectors/shared';
import { MFA_VERIFY } from '../selectors/mfa-verify';

export const mfaVerifyPage = {
  async goto(page: Page) {
    await page.goto(ROUTES.MFA_VERIFY);
  },

  async fillTotpCode(page: Page, code: string) {
    await page.fill(MFA_VERIFY.TOTP_CODE, code);
  },

  async submitTotp(page: Page) {
    await page.click(MFA_VERIFY.TOTP_VERIFY_BTN);
  },

  async submitTotpCode(page: Page, code: string) {
    await this.fillTotpCode(page, code);
    await this.submitTotp(page);
  },

  async clickSendEmailCode(page: Page) {
    await page.click(MFA_VERIFY.EMAIL_SEND_BTN);
  },

  async fillEmailCode(page: Page, code: string) {
    await page.fill(MFA_VERIFY.EMAIL_CODE, code);
  },

  async submitEmail(page: Page) {
    await page.click(MFA_VERIFY.EMAIL_VERIFY_BTN);
  },

  async submitEmailCode(page: Page, code: string) {
    await this.fillEmailCode(page, code);
    await this.submitEmail(page);
  },

  async clickCancel(page: Page) {
    await page.click(MFA_VERIFY.CANCEL_BTN);
  },

  async expectError(page: Page, message?: string) {
    const alert = page.locator(SHARED.ALERT_ERROR);
    await expect(alert).toBeVisible();
    if (message) await expect(alert).toContainText(message);
  },

  async expectRedirectToDashboard(page: Page) {
    await page.waitForURL(ROUTES.DASHBOARD);
  },
};
