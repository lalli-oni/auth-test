import { layout } from "../layout";

export interface LoginPageOptions {
  error?: string;
  success?: string;
}

export function loginPage(options: LoginPageOptions = {}): string {
  const { error, success } = options;

  const content = `
    <div class="auth-form-container">
      <h2>Login</h2>

      ${error ? `<div class="alert alert-error">${error}</div>` : ""}
      ${success ? `<div class="alert alert-success">${success}</div>` : ""}

      <form action="/auth/login" method="POST" class="auth-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            autocomplete="username"
            required
            autofocus
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            autocomplete="current-password"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary">Login</button>
      </form>

      <div class="auth-divider">
        <span>or</span>
      </div>

      <button onclick="WebAuthnClient.loginWithPasskey()" class="btn btn-secondary btn-full">
        Login with Passkey
      </button>

      <p class="auth-link">
        Don't have an account? <a href="/register">Register</a>
      </p>
    </div>
  `;

  return layout(content, { title: "Login" });
}
