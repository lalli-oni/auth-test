import type { FC } from 'hono/jsx';
import { Layout } from '../layout';

export const PasskeyPage: FC = () => (
  <Layout title="Passkey Authentication" showAdminPanel={false}>
    <div class="auth-form-container">
      <h2>Passkey Authentication</h2>
      <p>
        Initiating passkey authentication… If nothing happens, click the button
        below.
      </p>

      <div style={{ marginTop: '1rem' }}>
        <button
          type="button"
          class="btn btn-primary"
          onclick="if(window.WebAuthnClient) WebAuthnClient.loginWithPasskey();"
        >
          Trigger Passkey
        </button>
      </div>

      <script>
        {`(function tryCall(){
          if(window.WebAuthnClient && window.WebAuthnClient.loginWithPasskey){
            try { window.WebAuthnClient.loginWithPasskey(); } catch(e) { console.error('passkey auto-start failed', e); }
          } else {
            setTimeout(tryCall,50);
          }
        })();`}
      </script>
    </div>
  </Layout>
);

export default PasskeyPage;
