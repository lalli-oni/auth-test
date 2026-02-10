import { getDatabase } from '../db/database';

export interface Session {
  id: string;
  user_id: number;
  mfa_verified: number;
  expires_at: string;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface CreateSessionInput {
  userId: number;
  userAgent?: string;
  ipAddress?: string;
  mfaVerified?: boolean;
}

function generateSessionId(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function createSession(input: CreateSessionInput): Session {
  const db = getDatabase();
  const id = generateSessionId();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

  db.run(
    'INSERT INTO sessions (id, user_id, mfa_verified, expires_at, user_agent, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
    [
      id,
      input.userId,
      input.mfaVerified ? 1 : 0,
      expiresAt,
      input.userAgent || null,
      input.ipAddress || null,
    ],
  );

  return getSessionById(id)!;
}

export function getSessionById(id: string): Session | null {
  const db = getDatabase();
  return db
    .query('SELECT * FROM sessions WHERE id = ?')
    .get(id) as Session | null;
}

export function getValidSession(id: string): Session | null {
  const db = getDatabase();
  const session = db
    .query(
      "SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')",
    )
    .get(id) as Session | null;
  return session;
}

export function getSessionsByUserId(userId: number): Session[] {
  const db = getDatabase();
  return db
    .query('SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId) as Session[];
}

export function getAllSessions(): Session[] {
  const db = getDatabase();
  return db
    .query('SELECT * FROM sessions ORDER BY created_at DESC')
    .all() as Session[];
}

export function updateSessionMfaVerified(id: string, verified: boolean): void {
  const db = getDatabase();
  db.run('UPDATE sessions SET mfa_verified = ? WHERE id = ?', [
    verified ? 1 : 0,
    id,
  ]);
}

export function deleteSession(id: string): boolean {
  const db = getDatabase();
  const result = db.run('DELETE FROM sessions WHERE id = ?', [id]);
  return result.changes > 0;
}

export function deleteSessionsByUserId(userId: number): number {
  const db = getDatabase();
  const result = db.run('DELETE FROM sessions WHERE user_id = ?', [userId]);
  return result.changes;
}

export function deleteAllSessions(): number {
  const db = getDatabase();
  const result = db.run('DELETE FROM sessions');
  return result.changes;
}

export function cleanExpiredSessions(): number {
  const db = getDatabase();
  const result = db.run(
    "DELETE FROM sessions WHERE expires_at <= datetime('now')",
  );
  return result.changes;
}
