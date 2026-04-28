export const LOGIN = {
  FORM: 'form[action="/auth/login"]',

  // Inputs
  USERNAME: '#username',
  PASSWORD: '#password',
  REQUIRE_2FA: '#require_2fa',
  MFA_LABEL: '#mfa-label',

  // Variant checkboxes
  USE_FETCH: 'input[name="use_fetch"]',
  STAY_ON_PAGE: 'input[name="stay_on_page"]',
  REDIRECT_TO_LOGIN: 'input[name="redirect_to_login"]',

  // Buttons
  LOGIN_BTN: '.combo-btn-main',
  COMBO_TOGGLE: '.combo-btn-toggle',
  COMBO_DROPDOWN: '.combo-btn-dropdown',

  // Links in dropdown
  MULTI_STEP_LINK: 'a[href="/login/multi-step"]',

  // Navigation links
  REGISTER_LINK: 'a[href="/register"]',
} as const;
