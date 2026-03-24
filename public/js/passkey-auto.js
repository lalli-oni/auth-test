(() => {
  const _passkeyAutoLogger = Logger.create('PasskeyAuto');
  document.addEventListener('DOMContentLoaded', async () => {
    const el = document.getElementById('passkey-config');
    const mediation = el?.dataset.mediation || undefined;
    try {
      await window.WebAuthnClient.loginWithPasskey(mediation);
    } catch (e) {
      _passkeyAutoLogger.error(
        `Auto-trigger failed (mediation=${mediation}):`,
        e,
      );
    }
  });
})();
