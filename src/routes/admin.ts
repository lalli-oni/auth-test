import { Hono } from "hono";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updatePassword,
  deleteUser,
} from "../services/user.service";
import {
  getAllSessions,
  getSessionsByUserId,
  deleteSession,
  deleteAllSessions,
  deleteSessionsByUserId,
} from "../services/session.service";
import { getCurrentTotpCode, disableTotp } from "../services/totp.service";
import {
  createEmailCode,
  getActiveEmailCodes,
  getAllEmailCodes,
} from "../services/email-code.service";
import {
  getCredentialsByUserId,
  deleteCredential,
} from "../services/webauthn.service";
import { getAllAuthEvents, getAuthEventsByUserId } from "../services/auth-event.service";
import { resetDatabase } from "../db/database";

const admin = new Hono();

// List all users
admin.get("/users", (c) => {
  const users = getAllUsers();
  return c.json({
    success: true,
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      totpEnabled: !!u.totp_enabled,
      emailMfaEnabled: !!u.email_mfa_enabled,
      createdAt: u.created_at,
    })),
  });
});

// Create user
admin.post("/users", async (c) => {
  const body = await c.req.json();
  const { username, password, email } = body;

  if (!username || !password) {
    return c.json({ success: false, error: "Username and password are required" }, 400);
  }

  try {
    const user = await createUser({ username, password, email });
    return c.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
    }, 400);
  }
});

// Get user details
admin.get("/users/:id", (c) => {
  const id = parseInt(c.req.param("id"));
  const user = getUserById(id);

  if (!user) {
    return c.json({ success: false, error: "User not found" }, 404);
  }

  const sessions = getSessionsByUserId(id);
  const passkeys = getCredentialsByUserId(id);
  const emailCodes = getAllEmailCodes(id);
  const events = getAuthEventsByUserId(id, 20);

  return c.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      totpEnabled: !!user.totp_enabled,
      totpSecret: user.totp_secret,
      emailMfaEnabled: !!user.email_mfa_enabled,
      createdAt: user.created_at,
    },
    sessions: sessions.map((s) => ({
      id: s.id,
      mfaVerified: !!s.mfa_verified,
      expiresAt: s.expires_at,
      userAgent: s.user_agent,
      createdAt: s.created_at,
    })),
    passkeys: passkeys.map((p) => ({
      id: p.id,
      friendlyName: p.friendly_name,
      deviceType: p.device_type,
      backedUp: !!p.backed_up,
      createdAt: p.created_at,
    })),
    emailCodes: emailCodes.map((ec) => ({
      id: ec.id,
      code: ec.code,
      expiresAt: ec.expires_at,
      used: !!ec.used,
      createdAt: ec.created_at,
    })),
    recentEvents: events.map((e) => ({
      id: e.id,
      eventType: e.event_type,
      details: e.details ? JSON.parse(e.details) : null,
      createdAt: e.created_at,
    })),
  });
});

// Update user
admin.patch("/users/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const body = await c.req.json();
  const { username, email, totpEnabled, emailMfaEnabled } = body;

  const user = getUserById(id);
  if (!user) {
    return c.json({ success: false, error: "User not found" }, 404);
  }

  const updated = updateUser(id, {
    username,
    email,
    totp_enabled: totpEnabled,
    email_mfa_enabled: emailMfaEnabled,
  });

  return c.json({
    success: true,
    user: {
      id: updated!.id,
      username: updated!.username,
      email: updated!.email,
      totpEnabled: !!updated!.totp_enabled,
      emailMfaEnabled: !!updated!.email_mfa_enabled,
    },
  });
});

// Delete user
admin.delete("/users/:id", (c) => {
  const id = parseInt(c.req.param("id"));
  const deleted = deleteUser(id);

  if (!deleted) {
    return c.json({ success: false, error: "User not found" }, 404);
  }

  return c.json({ success: true });
});

// Reset password
admin.post("/users/:id/reset-password", async (c) => {
  const id = parseInt(c.req.param("id"));
  const body = await c.req.json();
  const { password } = body;

  if (!password) {
    return c.json({ success: false, error: "Password is required" }, 400);
  }

  const user = getUserById(id);
  if (!user) {
    return c.json({ success: false, error: "User not found" }, 404);
  }

  await updatePassword(id, password);

  return c.json({ success: true });
});

// Get current TOTP code
admin.get("/users/:id/totp/current", (c) => {
  const id = parseInt(c.req.param("id"));
  const user = getUserById(id);

  if (!user) {
    return c.json({ success: false, error: "User not found" }, 404);
  }

  if (!user.totp_secret) {
    return c.json({ success: false, error: "TOTP not configured" }, 400);
  }

  const result = getCurrentTotpCode(id);
  if (!result) {
    return c.json({ success: false, error: "Failed to generate code" }, 500);
  }

  return c.json({
    success: true,
    code: result.code,
    remainingSeconds: result.remainingSeconds,
    totpEnabled: !!user.totp_enabled,
  });
});

// Disable TOTP
admin.delete("/users/:id/totp", (c) => {
  const id = parseInt(c.req.param("id"));
  const user = getUserById(id);

  if (!user) {
    return c.json({ success: false, error: "User not found" }, 404);
  }

  disableTotp(id);

  return c.json({ success: true });
});

// Generate email code
admin.post("/users/:id/email-codes", (c) => {
  const id = parseInt(c.req.param("id"));
  const user = getUserById(id);

  if (!user) {
    return c.json({ success: false, error: "User not found" }, 404);
  }

  const code = createEmailCode(id);

  return c.json({
    success: true,
    code: {
      id: code.id,
      code: code.code,
      expiresAt: code.expires_at,
    },
  });
});

// List active email codes
admin.get("/users/:id/email-codes", (c) => {
  const id = parseInt(c.req.param("id"));
  const user = getUserById(id);

  if (!user) {
    return c.json({ success: false, error: "User not found" }, 404);
  }

  const codes = getActiveEmailCodes(id);

  return c.json({
    success: true,
    codes: codes.map((ec) => ({
      id: ec.id,
      code: ec.code,
      expiresAt: ec.expires_at,
      createdAt: ec.created_at,
    })),
  });
});

// List passkeys
admin.get("/users/:id/passkeys", (c) => {
  const id = parseInt(c.req.param("id"));
  const user = getUserById(id);

  if (!user) {
    return c.json({ success: false, error: "User not found" }, 404);
  }

  const passkeys = getCredentialsByUserId(id);

  return c.json({
    success: true,
    passkeys: passkeys.map((p) => ({
      id: p.id,
      friendlyName: p.friendly_name,
      deviceType: p.device_type,
      backedUp: !!p.backed_up,
      counter: p.counter,
      createdAt: p.created_at,
    })),
  });
});

// Delete passkey
admin.delete("/users/:id/passkeys/:credentialId", (c) => {
  const id = parseInt(c.req.param("id"));
  const credentialId = c.req.param("credentialId");

  const user = getUserById(id);
  if (!user) {
    return c.json({ success: false, error: "User not found" }, 404);
  }

  const deleted = deleteCredential(credentialId);
  if (!deleted) {
    return c.json({ success: false, error: "Passkey not found" }, 404);
  }

  return c.json({ success: true });
});

// List all sessions
admin.get("/sessions", (c) => {
  const sessions = getAllSessions();

  return c.json({
    success: true,
    sessions: sessions.map((s) => ({
      id: s.id,
      userId: s.user_id,
      mfaVerified: !!s.mfa_verified,
      expiresAt: s.expires_at,
      userAgent: s.user_agent,
      ipAddress: s.ip_address,
      createdAt: s.created_at,
    })),
  });
});

// Delete session
admin.delete("/sessions/:id", (c) => {
  const id = c.req.param("id");
  const deleted = deleteSession(id);

  if (!deleted) {
    return c.json({ success: false, error: "Session not found" }, 404);
  }

  return c.json({ success: true });
});

// Delete all sessions
admin.delete("/sessions", (c) => {
  const count = deleteAllSessions();
  return c.json({ success: true, deletedCount: count });
});

// Delete sessions for a user
admin.delete("/users/:id/sessions", (c) => {
  const id = parseInt(c.req.param("id"));
  const count = deleteSessionsByUserId(id);
  return c.json({ success: true, deletedCount: count });
});

// Get auth events
admin.get("/events", (c) => {
  const limit = parseInt(c.req.query("limit") || "100");
  const events = getAllAuthEvents(limit);

  return c.json({
    success: true,
    events: events.map((e) => ({
      id: e.id,
      userId: e.user_id,
      eventType: e.event_type,
      details: e.details ? JSON.parse(e.details) : null,
      createdAt: e.created_at,
    })),
  });
});

// Reset database
admin.post("/reset", (c) => {
  resetDatabase();
  return c.json({ success: true, message: "Database reset successfully" });
});

export default admin;
