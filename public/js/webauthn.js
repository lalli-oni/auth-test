// WebAuthn Client-side helpers

const WebAuthnClient = {
  _logger: Logger.create('WebAuthnClient'),

  // Convert base64url to ArrayBuffer
  base64urlToBuffer(base64url) {
    const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/') + padding;
    const rawData = atob(base64);
    const buffer = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      buffer[i] = rawData.charCodeAt(i);
    }
    return buffer.buffer;
  },

  // Convert ArrayBuffer to base64url
  bufferToBase64url(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  },

  // Register a new passkey
  async registerPasskey() {
    try {
      // Get registration options from server
      const optionsRes = await fetch('/webauthn/register/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const optionsData = await optionsRes.json();

      if (!optionsData.success) {
        this._logger.error(
          'Failed to get registration options:',
          optionsData.error,
        );
        return;
      }

      const options = optionsData.options;
      const requestToken = optionsData.requestToken;

      // Convert base64url strings to ArrayBuffers
      options.challenge = this.base64urlToBuffer(options.challenge);
      options.user.id = this.base64urlToBuffer(options.user.id);

      if (options.excludeCredentials) {
        options.excludeCredentials = options.excludeCredentials.map((cred) => ({
          ...cred,
          id: this.base64urlToBuffer(cred.id),
        }));
      }

      // Call WebAuthn API
      const credential = await navigator.credentials.create({
        publicKey: options,
      });

      // Ask for a friendly name
      const friendlyName =
        prompt(
          'Enter a name for this passkey (e.g., "MacBook Pro", "iPhone"):',
        ) || 'My Passkey';

      // Prepare response for server
      const response = {
        id: credential.id,
        rawId: this.bufferToBase64url(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: this.bufferToBase64url(
            credential.response.clientDataJSON,
          ),
          attestationObject: this.bufferToBase64url(
            credential.response.attestationObject,
          ),
          transports: credential.response.getTransports
            ? credential.response.getTransports()
            : [],
        },
        clientExtensionResults: credential.getClientExtensionResults(),
      };

      // Verify with server
      const verifyRes = await fetch('/webauthn/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response, requestToken, friendlyName }),
      });
      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        this._logger.info('Passkey registered successfully');
        window.location.reload();
      } else {
        this._logger.error('Failed to register passkey:', verifyData.error);
      }
    } catch (error) {
      this._logger.error(
        `Passkey registration error (${error.name}):`,
        error.message,
      );
    }
  },

  // Login with passkey
  async loginWithPasskey(mediation) {
    try {
      // Get authentication options from server
      const optionsRes = await fetch('/webauthn/auth/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const optionsData = await optionsRes.json();

      if (!optionsData.success) {
        this._logger.error(
          'Failed to get authentication options:',
          optionsData.error,
        );
        return;
      }

      const options = optionsData.options;
      const requestToken = optionsData.requestToken;

      // Convert base64url strings to ArrayBuffers
      options.challenge = this.base64urlToBuffer(options.challenge);

      if (options.allowCredentials) {
        options.allowCredentials = options.allowCredentials.map((cred) => ({
          ...cred,
          id: this.base64urlToBuffer(cred.id),
        }));
      }

      // Call WebAuthn API
      const credential = await navigator.credentials.get({
        publicKey: options,
        mediation,
      });

      this._logger.debug('Credential received', credential);

      // Prepare response for server
      const response = {
        id: credential.id,
        rawId: this.bufferToBase64url(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: this.bufferToBase64url(
            credential.response.clientDataJSON,
          ),
          authenticatorData: this.bufferToBase64url(
            credential.response.authenticatorData,
          ),
          signature: this.bufferToBase64url(credential.response.signature),
          userHandle: credential.response.userHandle
            ? this.bufferToBase64url(credential.response.userHandle)
            : null,
        },
        clientExtensionResults: credential.getClientExtensionResults(),
      };

      // Verify with server
      const verifyRes = await fetch('/webauthn/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response, requestToken }),
      });
      const verifyData = await verifyRes.json();

      this._logger.debug('Verification response', verifyData);

      if (verifyData.success) {
        this._logger.info(
          'Passkey authentication successful - action:',
          verifyData.action,
        );
        window.location.href = '/dashboard';
      } else {
        this._logger.error('Passkey authentication failed:', verifyData.error);
      }
    } catch (error) {
      this._logger.error(
        `Passkey authentication error (${error.name}):`,
        error.message,
      );
    }
  },
};

// Make it globally available
window.WebAuthnClient = WebAuthnClient;

// Close combo button dropdown when clicking outside
document.addEventListener('click', (e) => {
  document.querySelectorAll('.combo-btn.open').forEach((btn) => {
    if (!btn.contains(e.target)) {
      btn.classList.remove('open');
    }
  });
});
