import { test, expect } from '../fixtures';
import { multiStepLoginPage } from '../pages';
import { MESSAGES } from '../constants';

test.describe('Multi-Step Login', () => {
  test.beforeEach(async ({ page }) => {
    await multiStepLoginPage.goto(page);
  });

  test('should start on step 1', async ({ page }) => {
    await multiStepLoginPage.expectStep1Visible(page);
  });

  test('should transition to step 2 on continue', async ({ page }) => {
    await multiStepLoginPage.fillUsername(page, 'someuser');
    await multiStepLoginPage.clickContinue(page);
    await multiStepLoginPage.expectStep2Visible(page);
  });

  test('should show identity display on step 2', async ({ page }) => {
    await multiStepLoginPage.fillUsername(page, 'testident');
    await multiStepLoginPage.clickContinue(page);
    await multiStepLoginPage.expectIdentityDisplayed(page, 'testident');
  });

  test('should return to step 1 on back with username preserved', async ({ page }) => {
    await multiStepLoginPage.fillUsername(page, 'preserved');
    await multiStepLoginPage.clickContinue(page);
    await multiStepLoginPage.clickBack(page);
    await multiStepLoginPage.expectStep1Visible(page);
    await multiStepLoginPage.expectUsernameValue(page, 'preserved');
  });

  test('should not advance with empty username', async ({ page }) => {
    await multiStepLoginPage.clickContinue(page);
    // Should still be on step 1
    await multiStepLoginPage.expectStep1Visible(page);
  });

  test('should login successfully from step 2', async ({ page, testUser }) => {
    await multiStepLoginPage.fillAndSubmit(page, testUser.username, testUser.password);
    await multiStepLoginPage.expectRedirectToDashboard(page);
  });

  test('should show error for invalid password', async ({ page, testUser }) => {
    await multiStepLoginPage.fillAndSubmit(page, testUser.username, 'wrongpassword');
    await multiStepLoginPage.expectError(page, MESSAGES.INVALID_CREDENTIALS);
  });

  test('should preserve username on error re-render', async ({ page, testUser }) => {
    await multiStepLoginPage.fillAndSubmit(page, testUser.username, 'wrongpassword');
    await multiStepLoginPage.expectError(page, MESSAGES.INVALID_CREDENTIALS);
    // After server re-render, username should be pre-filled
    await multiStepLoginPage.expectUsernameValue(page, testUser.username);
  });
});
