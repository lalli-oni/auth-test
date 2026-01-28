import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { sessionMiddleware } from "./middleware/session";
import authRoutes from "./routes/auth";
import mfaRoutes from "./routes/mfa";
import webauthnRoutes from "./routes/webauthn";
import adminRoutes from "./routes/admin";
import { layout } from "./views/layout";
import { dashboardPage } from "./views/pages/dashboard";
import { adminScript } from "./views/scripts/admin";
import { getCredentialsByUserId } from "./services/webauthn.service";
import { getDatabase } from "./db/database";

const app = new Hono();

// Initialize database
getDatabase();

// Static files
app.use("/css/*", serveStatic({ root: "./public" }));

// Serve admin script from views
app.get("/js/admin.js", (c) => {
  return c.text(adminScript(), 200, { "Content-Type": "application/javascript" });
});

// Serve other JS files from public
app.use("/js/*", serveStatic({ root: "./public" }));

// Session middleware for all routes
app.use("*", sessionMiddleware);

// Mount routes
app.route("/auth", authRoutes);
app.route("/mfa", mfaRoutes);
app.route("/webauthn", webauthnRoutes);
app.route("/admin", adminRoutes);

// Home page
app.get("/", (c) => {
  const session = c.get("session");
  const user = c.get("user");

  if (session && user) {
    return c.redirect("/dashboard");
  }

  const content = `
    <div class="hero">
      <h2>Welcome to Auth Test App</h2>
      <p>A testing environment for authentication flows including:</p>
      <ul>
        <li>Username/Password authentication</li>
        <li>Passkeys (WebAuthn)</li>
        <li>Two-Factor Authentication (TOTP & Email codes)</li>
      </ul>
      <p>Use this app to test password managers and browser extensions.</p>
      <div class="hero-actions">
        <a href="/login" class="btn btn-primary">Login</a>
        <a href="/register" class="btn btn-secondary">Register</a>
      </div>
    </div>
  `;

  return c.html(layout(content, { title: "Home" }));
});

// Login/Register redirects
app.get("/login", (c) => c.redirect("/auth/login"));
app.get("/register", (c) => c.redirect("/auth/register"));

// Dashboard
app.get("/dashboard", (c) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!session || !user) {
    return c.redirect("/login");
  }

  // Check if MFA is required but not verified
  if ((user.totp_enabled || user.email_mfa_enabled) && !session.mfa_verified) {
    return c.redirect("/mfa/verify");
  }

  const passkeys = getCredentialsByUserId(user.id);
  const message = c.req.query("message");
  const error = c.req.query("error");

  return c.html(dashboardPage({ user, session, passkeys, message, error }));
});

// Start server
const port = 3000;
console.log(`Auth Test App running at http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
