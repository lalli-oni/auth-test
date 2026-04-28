# Auth Flows and Variants

## Auth flows

| Flow | Status | Password | MFA | Passkey | Route | Notes |
|------|--------|----------|-----|---------|-------|-------|
| **Login** | | | | | | |
| &nbsp;&nbsp;↳ Password | Implemented | yes | Optional | — | `/auth/login` | MFA checkbox; bypassed if unchecked |
| &nbsp;&nbsp;↳ Passkey | Implemented | — | — | yes | `/auth/login` | Combo button dropdown with mediation modes |
| &nbsp;&nbsp;↳ Passkey (dedicated page) | Implemented | — | — | yes | `/passkey-conditional` | Auto-triggers conditional mediation on load |
| &nbsp;&nbsp;↳ Identifier-first → password | Implemented | yes | Optional | — | `/login/multi-step` | Username on step 1, password on step 2 |
| &nbsp;&nbsp;↳ Identifier-first → passkey | Not implemented | — | — | yes | — | Username on step 1, passkey prompt on step 2 |
| &nbsp;&nbsp;↳ Identifier-first → code | Not implemented | — | TOTP or email | — | — | Username on step 1, code entry on step 2 |
| **Registration** | | | | | | |
| &nbsp;&nbsp;↳ Password registration | Implemented | yes | — | — | `/auth/register` | Email optional, not verified |
| &nbsp;&nbsp;↳ Passwordless (passkey-only) | Not implemented | — | — | yes | — | Registration always requires a password today |
| **MFA** | | | | | | |
| &nbsp;&nbsp;↳ MFA verify (post-login) | Implemented | — | TOTP or email | — | `/mfa/verify` | Triggered when session `mfa_verified: false` |
| &nbsp;&nbsp;↳ TOTP setup | Implemented | — | TOTP (setup) | — | Dashboard modal | QR code + manual entry; code verified before enabling |
| &nbsp;&nbsp;↳ Email MFA enable/disable | Implemented | — | Email (toggle) | — | Dashboard | No verification on enable; codes via admin API |
| &nbsp;&nbsp;↳ Backup / recovery codes | Not implemented | — | — | — | — | No fallback if TOTP device lost |
| **Passkeys** | | | | | | |
| &nbsp;&nbsp;↳ Register passkey | Implemented | — | — | yes | Dashboard | Requires active session |
| &nbsp;&nbsp;↳ Delete passkey | Implemented | — | — | yes | Dashboard | |
| **Account management** | | | | | | |
| &nbsp;&nbsp;↳ Change password | Implemented | yes | — | — | `/auth/change-password` | Requires authenticated + MFA-verified session |
| &nbsp;&nbsp;↳ Logout | Implemented | — | — | — | `POST /auth/logout` | Clears session from DB and cookie |
| &nbsp;&nbsp;↳ Forgot password | Not implemented | — | — | — | — | No reset flow |
| &nbsp;&nbsp;↳ Email verification | Not implemented | — | — | — | — | Email stored but never verified |
| &nbsp;&nbsp;↳ Social / OAuth | Not implemented | — | — | — | — | Out of scope |

## Variants

Variants modify how auth flows behave. They appear as combo button options or checkboxes on the form pages. Each variant has a type, the flows it applies to, and may have dependencies.

### Variant types

- **combo-option** — appears in a combo button dropdown. Selecting one navigates to a different page or triggers a different action. Only one combo-option in a group is active at a time.
- **checkbox** — appears as a toggleable checkbox on the form. Multiple checkboxes can be active simultaneously (unless noted as mutually exclusive).

### Variant reference

| ID | Label | Type | Flows | Group | Dependencies / Context |
|----|-------|------|-------|-------|----------------------|
| `conditional` | Conditional | combo-option | login, passkey-page | passkey-mediation | User must have a registered passkey |
| `conditional-page` | New page (conditional) | combo-option | login | passkey-mediation | User must have a registered passkey; navigates to `/passkey-conditional` |
| `undefined` | undefined | combo-option | login | passkey-mediation | User must have a registered passkey |
| `optional` | Optional | combo-option | login | passkey-mediation | User must have a registered passkey |
| `required` | Required | combo-option | login | passkey-mediation | User must have a registered passkey |
| `silent` | Silent | combo-option | login | passkey-mediation | User must have a registered passkey |
| `multi-step-login` | Multi-step (identifier first) | combo-option | login | login-method | Navigates to `/login/multi-step` |
| `require-2fa` | Login with 2FA | checkbox | login | — | User must have TOTP or email MFA enabled; checkbox is disabled until MFA status is confirmed via username blur |
| `skip-current` | Skip current password | checkbox | change-password | change-password | Requires authenticated session |
| `require-confirmation` | Require confirmation | checkbox | change-password | change-password | Requires authenticated session; can combine with `skip-current` |
| `use-fetch` | Use fetch | checkbox | login, register, change-password | — | Changes submission from form POST to fetch/XHR; DOM is preserved on response |
| `stay-on-page` | Stay on page after success | checkbox | login, register, change-password | — | Works with both form POST and fetch; server re-renders or returns JSON |
| `redirect-to-login` | Redirect to login after success | checkbox | login | — | Mutually exclusive intent with `stay-on-page` (if both checked, stay-on-page wins server-side) |
| `clear-fields` | Clear fields | checkbox | multi-step-login | — | Only available on `/login/multi-step`; removes username input from DOM on step 2 |

### Groups

Variants in the same group are related. For combo-options, only one in a group can be active (they're dropdown alternatives). For checkboxes, the group is informational.

| Group | Variants | Behavior |
|-------|----------|----------|
| `passkey-mediation` | conditional, conditional-page, undefined, optional, required, silent | Mutually exclusive — each sets a different `mediation` parameter for WebAuthn |
| `login-method` | multi-step-login | Navigation variant — redirects to a different login page |
| `change-password` | skip-current, require-confirmation | Independent checkboxes — can be combined |

### Variant compatibility matrix

Shows which variants can be combined on the same page. Only variants available on the same flow can interact.

**Login page** (`/auth/login`):

| | require-2fa | use-fetch | stay-on-page | redirect-to-login |
|-|-------------|-----------|--------------|-------------------|
| **require-2fa** | — | yes | no (redirects to MFA) | no (redirects to MFA) |
| **use-fetch** | yes | — | yes | yes |
| **stay-on-page** | no | yes | — | conflicts (stay wins) |
| **redirect-to-login** | no | yes | conflicts | — |

**Multi-step login** (`/login/multi-step`):

| | clear-fields | use-fetch | stay-on-page | redirect-to-login |
|-|--------------|-----------|--------------|-------------------|
| **clear-fields** | — | yes | yes | yes |
| **use-fetch** | yes | — | yes | yes |
| **stay-on-page** | yes | yes | — | conflicts (stay wins) |
| **redirect-to-login** | yes | yes | conflicts | — |

**Register page** (`/auth/register`):

| | use-fetch | stay-on-page |
|-|-----------|--------------|
| **use-fetch** | — | yes |
| **stay-on-page** | yes | — |

**Change password** (`/auth/change-password`):

| | skip-current | require-confirmation | use-fetch | stay-on-page |
|-|--------------|---------------------|-----------|--------------|
| **skip-current** | — | yes | yes | yes |
| **require-confirmation** | yes | — | yes | yes |
| **use-fetch** | yes | yes | — | yes |
| **stay-on-page** | yes | yes | yes | — |

### Test setup requirements

Some variants require specific user state to be meaningful. When writing tests:

| Variant | Required user state | How to set up via admin API |
|---------|--------------------|-----------------------------|
| `require-2fa` | TOTP or email MFA enabled | `PATCH /admin/users/:id` with `{ totpEnabled: true }` (requires TOTP secret to exist — set up via dashboard flow or direct DB) |
| `conditional` / passkey mediation variants | At least one registered passkey | Register via dashboard WebAuthn flow (no admin API shortcut — requires browser interaction) |
| `skip-current` / `require-confirmation` | Authenticated session with MFA verified | Login via browser, or create session via admin API |
| `clear-fields` | None (UI-only variant) | — |
| `use-fetch` / `stay-on-page` / `redirect-to-login` | None (UI-only variants) | — |
