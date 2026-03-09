(() => {
  const usernameInput = document.getElementById('username');
  const mfaCheckbox = document.getElementById('require_2fa');
  const mfaLabel = document.getElementById('mfa-label');

  if (!usernameInput || !mfaCheckbox || !mfaLabel) return;

  const TOOLTIP_ENTER_USERNAME =
    'Enter your username to check 2FA availability';
  const TOOLTIP_NO_MFA =
    '2FA is not set up. Log in and enable it in your dashboard.';

  let lastChecked = '';

  async function updateMfaCheckbox() {
    const username = usernameInput.value.trim();

    if (!username) {
      mfaCheckbox.disabled = true;
      mfaCheckbox.checked = false;
      mfaLabel.title = TOOLTIP_ENTER_USERNAME;
      lastChecked = '';
      return;
    }

    if (username === lastChecked) return;
    lastChecked = username;

    try {
      const res = await fetch(
        `/auth/mfa-status?username=${encodeURIComponent(username)}`,
      );
      const data = await res.json();

      if (data.hasMfa) {
        mfaCheckbox.disabled = false;
        mfaCheckbox.checked = true;
        mfaLabel.title = '';
      } else {
        mfaCheckbox.disabled = true;
        mfaCheckbox.checked = false;
        mfaLabel.title = TOOLTIP_NO_MFA;
      }
    } catch (e) {
      console.error('[Login] MFA status check failed:', e);
    }
  }

  usernameInput.addEventListener('blur', updateMfaCheckbox);
})();
