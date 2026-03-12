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
    id: 'stay-on-page',
    label: 'Stay on page after success',
    description: 'Show a success message without navigating away from the page',
    tooltip:
      'Form submits via fetch — no navigation or page reload occurs. The existing DOM is preserved and only the alert message is updated in place.',
    type: 'checkbox',
    flows: ['login', 'register', 'change-password'],
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
