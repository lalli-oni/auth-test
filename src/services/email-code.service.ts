import { getDatabase } from '../db/database';

export interface EmailCode {
  id: number;
  user_id: number;
  code: string;
  expires_at: string;
  used: number;
  created_at: string;
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function createEmailCode(userId: number): EmailCode {
  const db = getDatabase();
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

  // Invalidate any existing unused codes for this user
  db.run('UPDATE email_codes SET used = 1 WHERE user_id = ? AND used = 0', [
    userId,
  ]);

  const result = db.run(
    'INSERT INTO email_codes (user_id, code, expires_at) VALUES (?, ?, ?)',
    [userId, code, expiresAt],
  );

  return getEmailCodeById(Number(result.lastInsertRowid))!;
}

export function getEmailCodeById(id: number): EmailCode | null {
  const db = getDatabase();
  return db
    .query('SELECT * FROM email_codes WHERE id = ?')
    .get(id) as EmailCode | null;
}

export function getActiveEmailCodes(userId: number): EmailCode[] {
  const db = getDatabase();
  return db
    .query(
      "SELECT * FROM email_codes WHERE user_id = ? AND used = 0 AND expires_at > datetime('now') ORDER BY created_at DESC",
    )
    .all(userId) as EmailCode[];
}

export function getAllEmailCodes(userId: number): EmailCode[] {
  const db = getDatabase();
  return db
    .query(
      'SELECT * FROM email_codes WHERE user_id = ? ORDER BY created_at DESC',
    )
    .all(userId) as EmailCode[];
}

export function verifyEmailCode(userId: number, code: string): boolean {
  const db = getDatabase();
  const emailCode = db
    .query(
      "SELECT * FROM email_codes WHERE user_id = ? AND code = ? AND used = 0 AND expires_at > datetime('now')",
    )
    .get(userId, code) as EmailCode | null;

  if (!emailCode) return false;

  // Mark the code as used
  db.run('UPDATE email_codes SET used = 1 WHERE id = ?', [emailCode.id]);

  return true;
}

export function deleteEmailCodesByUserId(userId: number): number {
  const db = getDatabase();
  const result = db.run('DELETE FROM email_codes WHERE user_id = ?', [userId]);
  return result.changes;
}
