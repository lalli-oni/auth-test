export const SHARED = {
  // Alerts
  ALERT_CONTAINER: '#alert-container',
  ALERT_ERROR: '.alert.alert-error',
  ALERT_SUCCESS: '.alert.alert-success',

  // Form containers
  AUTH_FORM: '.auth-form',
  AUTH_CARD: '.auth-form-container',

  // Password input component
  PASSWORD_WRAPPER: '.password-wrapper',
  PASSWORD_TOGGLE: '.password-toggle',

  // Combo button component
  COMBO_BTN: '.combo-btn',
  COMBO_BTN_MAIN: '.combo-btn-main',
  COMBO_BTN_TOGGLE: '.combo-btn-toggle',
  COMBO_BTN_DROPDOWN: '.combo-btn-dropdown',

  // Variant checkbox helper
  variantCheckbox: (variantId: string) =>
    `input[name="${variantId.replace(/-/g, '_')}"]`,

  // Generic helpers
  submitButton: 'button[type="submit"]',
} as const;
