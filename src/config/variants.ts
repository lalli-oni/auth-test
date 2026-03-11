export interface Variant {
  id: string;
  label: string;
  description: string;
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
    type: 'combo-option',
    flows: ['login', 'passkey-page'],
    group: 'passkey-mediation',
  },
  {
    id: 'conditional-page',
    label: 'New page (conditional)',
    description:
      'Navigates to a dedicated page with conditional mediation auto-trigger',
    type: 'combo-option',
    flows: ['login'],
    group: 'passkey-mediation',
  },
  {
    id: 'undefined',
    label: 'undefined',
    description: 'Passes undefined as mediation parameter (browser default)',
    type: 'combo-option',
    flows: ['login'],
    group: 'passkey-mediation',
  },
  {
    id: 'optional',
    label: 'Optional',
    description: 'Uses optional mediation mode',
    type: 'combo-option',
    flows: ['login'],
    group: 'passkey-mediation',
  },
  {
    id: 'required',
    label: 'Required',
    description: 'Uses required mediation mode',
    type: 'combo-option',
    flows: ['login'],
    group: 'passkey-mediation',
  },
  {
    id: 'silent',
    label: 'Silent',
    description: 'Uses silent mediation mode',
    type: 'combo-option',
    flows: ['login'],
    group: 'passkey-mediation',
  },
  {
    id: 'require-2fa',
    label: 'Login with 2FA',
    description: 'Require two-factor authentication during login',
    type: 'checkbox',
    flows: ['login'],
  },
  {
    id: 'skip-current',
    label: 'Skip current password',
    description: 'Allow changing password without entering current password',
    type: 'checkbox',
    flows: ['change-password'],
    group: 'change-password',
  },
  {
    id: 'require-confirmation',
    label: 'Require confirmation',
    description: 'Require typing the new password twice',
    type: 'checkbox',
    flows: ['change-password'],
    group: 'change-password',
  },
  {
    id: 'stay-on-page',
    label: 'Stay on page after success',
    description:
      'Re-render the current page with a success message instead of redirecting',
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
