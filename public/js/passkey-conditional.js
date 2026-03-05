(() => {
  function tryCall() {
    if (window.WebAuthnClient?.loginWithPasskey) {
      try {
        window.WebAuthnClient.loginWithPasskey('conditional');
      } catch (e) {
        console.error('passkey auto-start failed', e);
      }
    } else {
      setTimeout(tryCall, 50);
    }
  }
  tryCall();
})();
