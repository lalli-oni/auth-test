import { Hono } from "hono";
import {
  createUser,
  getUserByUsername,
  verifyPassword,
} from "../services/user.service";
import {
  createSession,
  deleteSession,
} from "../services/session.service";
import { logAuthEvent } from "../services/auth-event.service";
import {
  setSessionCookie,
  clearSessionCookie,
} from "../middleware/session";
import { loginPage } from "../views/pages/login";
import { registerPage } from "../views/pages/register";

const auth = new Hono();

// Login page
auth.get("/login", (c) => {
  const session = c.get("session");
  if (session) {
    return c.redirect("/dashboard");
  }
  return c.html(loginPage());
});

// Login handler
auth.post("/login", async (c) => {
  const body = await c.req.parseBody();
  const username = body.username as string;
  const password = body.password as string;

  if (!username || !password) {
    return c.html(loginPage({ error: "Username and password are required" }));
  }

  const user = getUserByUsername(username);
  if (!user) {
    logAuthEvent("login_failed", undefined, { username, reason: "user_not_found" });
    return c.html(loginPage({ error: "Invalid username or password" }));
  }

  const validPassword = await verifyPassword(user, password);
  if (!validPassword) {
    logAuthEvent("login_failed", user.id, { reason: "invalid_password" });
    return c.html(loginPage({ error: "Invalid username or password" }));
  }

  // Create session
  const session = createSession({
    userId: user.id,
    userAgent: c.req.header("User-Agent"),
    ipAddress: c.req.header("X-Forwarded-For") || c.req.header("X-Real-IP"),
    mfaVerified: !(user.totp_enabled || user.email_mfa_enabled),
  });

  setSessionCookie(c, session.id);
  logAuthEvent("login_success", user.id);

  // Redirect based on MFA status
  if (user.totp_enabled || user.email_mfa_enabled) {
    return c.redirect("/mfa/verify");
  }

  return c.redirect("/dashboard");
});

// Register page
auth.get("/register", (c) => {
  const session = c.get("session");
  if (session) {
    return c.redirect("/dashboard");
  }
  return c.html(registerPage());
});

// Register handler
auth.post("/register", async (c) => {
  const body = await c.req.parseBody();
  const username = body.username as string;
  const email = body.email as string | undefined;
  const password = body.password as string;
  const confirmPassword = body.confirm_password as string;

  if (!username || !password) {
    return c.html(registerPage({ error: "Username and password are required" }));
  }

  if (password !== confirmPassword) {
    return c.html(registerPage({ error: "Passwords do not match" }));
  }

  if (password.length < 6) {
    return c.html(registerPage({ error: "Password must be at least 6 characters" }));
  }

  const existingUser = getUserByUsername(username);
  if (existingUser) {
    return c.html(registerPage({ error: "Username already taken" }));
  }

  try {
    const user = await createUser({ username, password, email });
    logAuthEvent("register", user.id);

    // Create session and log in
    const session = createSession({
      userId: user.id,
      userAgent: c.req.header("User-Agent"),
      ipAddress: c.req.header("X-Forwarded-For") || c.req.header("X-Real-IP"),
      mfaVerified: true, // No MFA enabled yet
    });

    setSessionCookie(c, session.id);

    return c.redirect("/dashboard");
  } catch (error) {
    return c.html(
      registerPage({
        error: "Failed to create account. Please try again.",
      })
    );
  }
});

// Logout handler
auth.post("/logout", (c) => {
  const session = c.get("session");

  if (session) {
    logAuthEvent("logout", session.user_id);
    deleteSession(session.id);
  }

  clearSessionCookie(c);
  return c.redirect("/login");
});

// Auth status API (for JS clients)
auth.get("/status", (c) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!session || !user) {
    return c.json({ authenticated: false });
  }

  return c.json({
    authenticated: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      totpEnabled: !!user.totp_enabled,
      emailMfaEnabled: !!user.email_mfa_enabled,
    },
    session: {
      mfaVerified: !!session.mfa_verified,
      expiresAt: session.expires_at,
    },
  });
});

export default auth;
