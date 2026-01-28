import { getDatabase } from "../db/database";

export interface AuthEvent {
  id: number;
  user_id: number | null;
  event_type: string;
  details: string | null;
  created_at: string;
}

export type AuthEventType =
  | "login_success"
  | "login_failed"
  | "logout"
  | "register"
  | "password_reset"
  | "mfa_totp_enabled"
  | "mfa_totp_disabled"
  | "mfa_totp_verified"
  | "mfa_totp_failed"
  | "mfa_email_enabled"
  | "mfa_email_disabled"
  | "mfa_email_sent"
  | "mfa_email_verified"
  | "mfa_email_failed"
  | "passkey_registered"
  | "passkey_deleted"
  | "passkey_auth_success"
  | "passkey_auth_failed";

export function logAuthEvent(
  eventType: AuthEventType,
  userId?: number,
  details?: Record<string, any>
): AuthEvent {
  const db = getDatabase();

  const result = db.run(
    "INSERT INTO auth_events (user_id, event_type, details) VALUES (?, ?, ?)",
    [userId || null, eventType, details ? JSON.stringify(details) : null]
  );

  return getAuthEventById(Number(result.lastInsertRowid))!;
}

export function getAuthEventById(id: number): AuthEvent | null {
  const db = getDatabase();
  return db.query("SELECT * FROM auth_events WHERE id = ?").get(id) as AuthEvent | null;
}

export function getAuthEventsByUserId(userId: number, limit = 50): AuthEvent[] {
  const db = getDatabase();
  return db
    .query(
      "SELECT * FROM auth_events WHERE user_id = ? ORDER BY created_at DESC LIMIT ?"
    )
    .all(userId, limit) as AuthEvent[];
}

export function getAllAuthEvents(limit = 100): AuthEvent[] {
  const db = getDatabase();
  return db
    .query("SELECT * FROM auth_events ORDER BY created_at DESC LIMIT ?")
    .all(limit) as AuthEvent[];
}

export function deleteAuthEventsByUserId(userId: number): number {
  const db = getDatabase();
  const result = db.run("DELETE FROM auth_events WHERE user_id = ?", [userId]);
  return result.changes;
}
