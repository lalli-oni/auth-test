(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById('passkey-config');
    const mediation = el?.dataset.mediation || undefined;
    try {
      window.WebAuthnClient.loginWithPasskey(mediation);
    } catch (e) {
      console.error(
        '[PasskeyAuto] Auto-trigger failed (mediation=%s):',
        mediation,
        e,
      );
    }
  });
})();
