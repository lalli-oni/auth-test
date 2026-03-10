import type { FC } from 'hono/jsx';
import { Layout } from '../layout';

export interface PasskeyPageProps {
  mediation?: string;
}

export const PasskeyPage: FC<PasskeyPageProps> = ({ mediation }) => {
  const onclickArg = mediation ? `'${mediation}'` : 'undefined';
  return (
    <Layout title="Passkey Authentication">
      <div class="auth-form-container">
        <h2>Passkey Authentication</h2>
        <p>
          Initiating passkey authentication… If nothing happens, click the
          button below.
        </p>

        <div style={{ marginTop: '1rem' }}>
          <button
            type="button"
            class="btn btn-primary"
            onclick={`if(window.WebAuthnClient) WebAuthnClient.loginWithPasskey(${onclickArg});`}
          >
            Trigger Passkey
          </button>
        </div>

        {/* Data attribute lets passkey-auto.js read the mediation mode */}
        <div id="passkey-config" data-mediation={mediation || ''} />
        <script src="/js/passkey-auto.js" />
      </div>
    </Layout>
  );
};

export default PasskeyPage;
