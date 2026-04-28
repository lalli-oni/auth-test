export const CHANGE_PASSWORD = {
  FORM: 'form[action="/auth/change-password"]',

  // Inputs
  CURRENT_PASSWORD: '#current_password',
  NEW_PASSWORD: '#new_password',
  CONFIRM_NEW_PASSWORD: '#confirm_new_password',

  // Hidden inputs
  USERNAME_HIDDEN: 'input[name="username"][readonly]',
  NO_CURRENT_HIDDEN: 'input[name="no_current"]',
  WITH_CONFIRMATION_HIDDEN: 'input[name="with_confirmation"]',

  // Variant checkboxes
  USE_FETCH: 'input[name="use_fetch"]',
  STAY_ON_PAGE: 'input[name="stay_on_page"]',

  // Buttons
  SUBMIT_BTN: 'button[type="submit"]',

  // Navigation
  BACK_LINK: 'a[href="/dashboard"]',
} as const;
