export const REGISTER = {
  FORM: 'form[action="/auth/register"]',

  // Inputs
  USERNAME: '#username',
  EMAIL: '#email',
  PASSWORD: '#password',
  CONFIRM_PASSWORD: '#confirm_password',

  // Variant checkboxes
  USE_FETCH: 'input[name="use_fetch"]',
  STAY_ON_PAGE: 'input[name="stay_on_page"]',

  // Buttons
  SUBMIT_BTN: 'button[type="submit"]',

  // Navigation
  LOGIN_LINK: 'a[href="/login"]',
} as const;
