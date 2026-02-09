import { Hono } from "hono";
import {
  generateRegistrationOptionsForUser,
  verifyRegistrationResponseForUser,
  generateAuthenticationOptionsForUser,
  verifyAuthenticationResponseForUser,
  getCredentialsByUserId,
  deleteCredential,
} from "../services/webauthn.service";
import { createSession, updateSessionMfaVerified } from "../services/session.service";
import { logAuthEvent } from "../services/auth-event.service";
import { setSessionCookie } from "../middleware/session";

const webauthn = new Hono();

// Registration: Get options
webauthn.post("/register/options", async (c) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!session || !user) {
    return c.json({ success: false, error: "Not authenticated" }, 401);
  }

  const result = await generateRegistrationOptionsForUser(user.id);
  if (!result) {
    return c.json({ success: false, error: "Failed to generate options" });
  }

  return c.json({ success: true, options: result.options, requestToken: result.requestToken });
});

// Registration: Verify response
webauthn.post("/register/verify", async (c) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!session || !user) {
    return c.json({ success: false, error: "Not authenticated" }, 401);
  }

  const body = await c.req.json();
  const { response, requestToken, friendlyName } = body;

  if (!response) {
    return c.json({ success: false, error: "Response is required" });
  }

  if (!requestToken) {
    return c.json({ success: false, error: "Request token is required" });
  }

  const result = await verifyRegistrationResponseForUser(
    user.id,
    response,
    requestToken,
    friendlyName
  );

  if (result.verified) {
    logAuthEvent("passkey_registered", user.id, { friendlyName });
    return c.json({ success: true });
  }

  logAuthEvent("passkey_auth_failed", user.id, {
    action: "register",
    error: result.error,
  });
  return c.json({ success: false, error: result.error });
});

// Authentication: Get options (can be called without session for passkey-only login)
webauthn.post("/auth/options", async (c) => {
  const session = c.get("session");
  const user = c.get("user");

  // If user is logged in, limit to their credentials
  const result = await generateAuthenticationOptionsForUser(user?.id);

  return c.json({ success: true, options: result.options, requestToken: result.requestToken });
});

// Authentication: Verify response
webauthn.post("/auth/verify", async (c) => {
  const body = await c.req.json();
  const { response, requestToken } = body;

  if (!response) {
    return c.json({ success: false, error: "Response is required" });
  }

  if (!requestToken) {
    return c.json({ success: false, error: "Request token is required" });
  }

  const session = c.get("session");

  const result = await verifyAuthenticationResponseForUser(
    response,
    requestToken,
    session?.user_id
  );

  if (result.verified && result.userId) {
    // If user is already logged in and just verifying MFA with passkey
    if (session && session.user_id === result.userId) {
      updateSessionMfaVerified(session.id, true);
      logAuthEvent("passkey_auth_success", result.userId, { action: "mfa" });
      return c.json({ success: true, action: "mfa_verified" });
    }

    // Create new session for passkey-only login
    const newSession = createSession({
      userId: result.userId,
      userAgent: c.req.header("User-Agent"),
      ipAddress: c.req.header("X-Forwarded-For") || c.req.header("X-Real-IP"),
      mfaVerified: true, // Passkey login counts as MFA
    });

    setSessionCookie(c, newSession.id);
    logAuthEvent("passkey_auth_success", result.userId, { action: "login" });

    return c.json({ success: true, action: "logged_in" });
  }

  logAuthEvent("passkey_auth_failed", session?.user_id, {
    action: "auth",
    error: result.error,
  });
  return c.json({ success: false, error: result.error });
});

// Delete credential
webauthn.delete("/credential/:id", (c) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!session || !user) {
    return c.json({ success: false, error: "Not authenticated" }, 401);
  }

  const credentialId = c.req.param("id");

  // Verify the credential belongs to the user
  const credentials = getCredentialsByUserId(user.id);
  const credential = credentials.find((c) => c.id === credentialId);

  if (!credential) {
    return c.json({ success: false, error: "Credential not found" });
  }

  deleteCredential(credentialId);
  logAuthEvent("passkey_deleted", user.id, { credentialId });

  return c.json({ success: true });
});

export default webauthn;
