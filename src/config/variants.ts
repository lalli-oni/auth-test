export interface Variant {
  id: string;
  label: string;
  description: string;
  tooltip?: string;
  type: 'combo-option' | 'checkbox';
  flows: string[];
  group?: string;
}

export const VARIANTS: Variant[] = [
  {
    id: 'conditional',
    label: 'Conditional',
    description:
      'Uses conditional mediation UI - browser shows passkey if available',
    tooltip:
      'Sets mediation: "conditional". The browser silently checks for passkeys and shows an autofill suggestion if one exists, without a modal prompt.',
    type: 'combo-option',
    flows: ['login', 'passkey-page'],
    group: 'passkey-mediation',
  },
  {
    id: 'conditional-page',
    label: 'New page (conditional)',
    description:
      'Navigates to a dedicated page with conditional mediation auto-trigger',
    tooltip:
      'Opens /passkey-conditional which immediately starts a conditional mediation request on page load. Tests the dedicated-page passkey UX.',
    type: 'combo-option',
    flows: ['login'],
    group: 'passkey-mediation',
  },
  {
    id: 'undefined',
    label: 'undefined',
    description: 'Passes undefined as mediation parameter (browser default)',
    tooltip:
      'Omits the mediation parameter entirely, letting the browser use its default behavior (typically equivalent to "optional").',
    type: 'combo-option',
    flows: ['login'],
    group: 'passkey-mediation',
  },
  {
    id: 'optional',
    label: 'Optional',
    description: 'Uses optional mediation mode',
    tooltip:
      'Sets mediation: "optional". The browser may show a credential picker modal but the user can dismiss it.',
    type: 'combo-option',
    flows: ['login'],
    group: 'passkey-mediation',
  },
  {
    id: 'required',
    label: 'Required',
    description: 'Uses required mediation mode',
    tooltip:
      'Sets mediation: "required". The browser must show a credential picker and the user must interact with it to proceed.',
    type: 'combo-option',
    flows: ['login'],
    group: 'passkey-mediation',
  },
  {
    id: 'silent',
    label: 'Silent',
    description: 'Uses silent mediation mode',
    tooltip:
      'Sets mediation: "silent". The browser attempts to use a credential without any user interaction. Fails if user action is needed.',
    type: 'combo-option',
    flows: ['login'],
    group: 'passkey-mediation',
  },
  {
    id: 'require-2fa',
    label: 'Login with 2FA',
    description: 'Require two-factor authentication during login',
    tooltip:
      'After password login, redirects to the MFA verification page before granting access. Only available when the user has TOTP or email MFA enabled.',
    type: 'checkbox',
    flows: ['login'],
  },
  {
    id: 'skip-current',
    label: 'Skip current password',
    description: 'Allow changing password without entering current password',
    tooltip:
      'Removes the current password field. Tests the UX where the server trusts the session and does not re-verify the old password.',
    type: 'checkbox',
    flows: ['change-password'],
    group: 'change-password',
  },
  {
    id: 'require-confirmation',
    label: 'Require confirmation',
    description: 'Require typing the new password twice',
    tooltip:
      'Adds a "confirm new password" field. The server rejects the request if the two values do not match.',
    type: 'checkbox',
    flows: ['change-password'],
    group: 'change-password',
  },
  {
    id: 'use-fetch',
    label: 'Use fetch',
    description: 'Submit the form via fetch instead of a real form POST',
    tooltip:
      'JavaScript intercepts the form submit and sends it via fetch with XMLHttpRequest header. The browser does not navigate — the DOM is preserved. Extensions typically do not detect this as a manual form submission.',
    type: 'checkbox',
    flows: ['login', 'register', 'change-password'],
  },
  {
    id: 'stay-on-page',
    label: 'Stay on page after success',
    description:
      'Stay on the current page after success instead of redirecting',
    tooltip:
      'After successful submission, the page shows a success message without navigating away. With fetch: the DOM is preserved and only the alert updates. With POST: the server re-renders the same page with a success message.',
    type: 'checkbox',
    flows: ['login', 'register', 'change-password'],
  },
  {
    id: 'redirect-to-login',
    label: 'Redirect to login after success',
    description:
      'Redirect back to the login page after successful authentication',
    tooltip:
      'After successful login, the server responds with a 302 redirect back to /auth/login instead of /dashboard. The login form is visible again with the user authenticated. Useful for testing extension behavior when a cached dialog exists and the form is still active.',
    type: 'checkbox',
    flows: ['login'],
  },
];

export function getVariantsByFlow(flow: string): Variant[] {
  return VARIANTS.filter((v) => v.flows.includes(flow));
}

export function getVariantsByGroup(group: string): Variant[] {
  return VARIANTS.filter((v) => v.group === group);
}

export function getVariantById(id: string): Variant | undefined {
  return VARIANTS.find((v) => v.id === id);
}
