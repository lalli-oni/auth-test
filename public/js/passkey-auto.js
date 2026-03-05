(() => {
  function tryCall() {
    if (window.WebAuthnClient?.loginWithPasskey) {
      const el = document.getElementById('passkey-config');
      const mediation = el?.dataset.mediation || undefined;
      try {
        window.WebAuthnClient.loginWithPasskey(mediation);
      } catch (e) {
        console.error('passkey auto-start failed', e);
      }
    } else {
      setTimeout(tryCall, 50);
    }
  }
  tryCall();
})();
