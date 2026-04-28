export const MULTI_STEP_LOGIN = {
  FORM: 'form[action="/auth/login"]',
  SOURCE_HIDDEN: 'input[name="source"]',

  // Step containers
  STEP_1: '#step-1',
  STEP_2: '#step-2',
  IDENTITY_DISPLAY: '#identity-display',

  // Step 1
  USERNAME: '#username',
  CONTINUE_BTN: '#continue-btn',

  // Step 2
  PASSWORD: '#password',
  REQUIRE_2FA: '#require_2fa',
  SUBMIT_BTN: '#step-2 button[type="submit"]',
  BACK_BTN: '#back-btn',

  // Variant checkboxes
  CLEAR_FIELDS: 'input[name="clear_fields"]',
  USE_FETCH: 'input[name="use_fetch"]',
  STAY_ON_PAGE: 'input[name="stay_on_page"]',
  REDIRECT_TO_LOGIN: 'input[name="redirect_to_login"]',

  // Navigation
  STANDARD_LOGIN_LINK: 'a[href="/login"]',
} as const;
