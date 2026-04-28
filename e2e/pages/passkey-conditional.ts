import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { ROUTES } from '../constants';
import { PASSKEY_CONDITIONAL } from '../selectors/passkey-conditional';

export const passkeyConditionalPage = {
  async goto(page: Page) {
    await page.goto(ROUTES.PASSKEY_CONDITIONAL);
  },

  async expectLoaded(page: Page) {
    await expect(page.locator(PASSKEY_CONDITIONAL.AUTH_CONTAINER)).toBeVisible();
  },

  async clickTriggerPasskey(page: Page) {
    await page.click(PASSKEY_CONDITIONAL.TRIGGER_BTN);
  },
};
