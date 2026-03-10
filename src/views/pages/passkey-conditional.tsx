import type { FC } from 'hono/jsx';
import { Layout } from '../layout';

export const PasskeyConditionalPage: FC = () => (
  <Layout title="Passkey Authentication (Conditional)">
    <div class="auth-form-container">
      <h2>Passkey Authentication</h2>
      <p>
        Initiating conditional passkey request… If nothing happens, click the
        button below.
      </p>

      <div style={{ marginTop: '1rem' }}>
        <button
          type="button"
          class="btn btn-primary"
          onclick="if(window.WebAuthnClient) WebAuthnClient.loginWithPasskey('conditional');"
        >
          Trigger Passkey
        </button>
      </div>

      <div id="passkey-config" data-mediation="conditional" />
      <script src="/js/passkey-auto.js" />
    </div>
  </Layout>
);

export default PasskeyConditionalPage;
