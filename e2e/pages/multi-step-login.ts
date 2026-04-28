import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { ROUTES } from '../constants';
import { SHARED } from '../selectors/shared';
import { MULTI_STEP_LOGIN } from '../selectors/multi-step-login';

export const multiStepLoginPage = {
  async goto(page: Page) {
    await page.goto(ROUTES.LOGIN_MULTI_STEP);
  },

  async fillUsername(page: Page, username: string) {
    await page.fill(MULTI_STEP_LOGIN.USERNAME, username);
  },

  async clickContinue(page: Page) {
    await page.click(MULTI_STEP_LOGIN.CONTINUE_BTN);
  },

  async fillPassword(page: Page, password: string) {
    await page.fill(MULTI_STEP_LOGIN.PASSWORD, password);
  },

  async clickBack(page: Page) {
    await page.click(MULTI_STEP_LOGIN.BACK_BTN);
  },

  async submit(page: Page) {
    await page.click(MULTI_STEP_LOGIN.SUBMIT_BTN);
  },

  async fillAndSubmit(page: Page, username: string, password: string) {
    await this.fillUsername(page, username);
    await this.clickContinue(page);
    await this.fillPassword(page, password);
    await this.submit(page);
  },

  async checkClearFields(page: Page) {
    await page.check(MULTI_STEP_LOGIN.CLEAR_FIELDS);
  },

  async checkVariant(page: Page, variant: 'use_fetch' | 'stay_on_page' | 'redirect_to_login') {
    await page.check(SHARED.variantCheckbox(variant));
  },

  async expectStep1Visible(page: Page) {
    await expect(page.locator(MULTI_STEP_LOGIN.STEP_1)).toBeVisible();
    await expect(page.locator(MULTI_STEP_LOGIN.STEP_2)).toBeHidden();
  },

  async expectStep2Visible(page: Page) {
    await expect(page.locator(MULTI_STEP_LOGIN.STEP_2)).toBeVisible();
    await expect(page.locator(MULTI_STEP_LOGIN.STEP_1)).toBeHidden();
  },

  async expectIdentityDisplayed(page: Page, username: string) {
    const display = page.locator(MULTI_STEP_LOGIN.IDENTITY_DISPLAY);
    await expect(display).toBeVisible();
    await expect(display).toHaveText(username);
  },

  async expectUsernameValue(page: Page, username: string) {
    await expect(page.locator(MULTI_STEP_LOGIN.USERNAME)).toHaveValue(username);
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
