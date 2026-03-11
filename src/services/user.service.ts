import { getDatabase } from '../db/database';

interface UserRow {
  id: number;
  username: string;
  email: string | null;
  password_hash: string;
  totp_enabled: number;
  totp_secret: string | null;
  email_mfa_enabled: number;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string | null;
  password_hash: string;
  totp_enabled: boolean;
  totp_secret: string | null;
  email_mfa_enabled: boolean;
  created_at: string;
}

export interface CreateUserInput {
  username: string;
  password: string;
  email?: string;
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  totp_enabled?: boolean;
  totp_secret?: string | null;
  email_mfa_enabled?: boolean;
}

function toUser(row: UserRow): User {
  return {
    ...row,
    totp_enabled: !!row.totp_enabled,
    email_mfa_enabled: !!row.email_mfa_enabled,
  };
}

export async function createUser(input: CreateUserInput): Promise<User> {
  if (input.password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const db = getDatabase();
  const passwordHash = await Bun.password.hash(input.password);

  const result = db.run(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    [input.username, input.email || null, passwordHash],
  );

  return getUserById(Number(result.lastInsertRowid))!;
}

export function getUserById(id: number): User | null {
  const db = getDatabase();
  const row = db
    .query('SELECT * FROM users WHERE id = ?')
    .get(id) as UserRow | null;
  return row ? toUser(row) : null;
}

export function getUserByUsername(username: string): User | null {
  const db = getDatabase();
  const row = db
    .query('SELECT * FROM users WHERE username = ?')
    .get(username) as UserRow | null;
  return row ? toUser(row) : null;
}

export function getAllUsers(): User[] {
  const db = getDatabase();
  const rows = db
    .query('SELECT * FROM users ORDER BY created_at DESC')
    .all() as UserRow[];
  return rows.map(toUser);
}

export function updateUser(id: number, input: UpdateUserInput): User | null {
  const db = getDatabase();
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (input.username !== undefined) {
    updates.push('username = ?');
    values.push(input.username);
  }
  if (input.email !== undefined) {
    updates.push('email = ?');
    values.push(input.email);
  }
  if (input.totp_enabled !== undefined) {
    updates.push('totp_enabled = ?');
    values.push(input.totp_enabled ? 1 : 0);
  }
  if (input.totp_secret !== undefined) {
    updates.push('totp_secret = ?');
    values.push(input.totp_secret);
  }
  if (input.email_mfa_enabled !== undefined) {
    updates.push('email_mfa_enabled = ?');
    values.push(input.email_mfa_enabled ? 1 : 0);
  }

  if (updates.length === 0) {
    return getUserById(id);
  }

  values.push(id);
  db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

  return getUserById(id);
}

export async function updatePassword(
  id: number,
  newPassword: string,
): Promise<void> {
  if (newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  const db = getDatabase();
  const passwordHash = await Bun.password.hash(newPassword);
  db.run('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
}

export function deleteUser(id: number): boolean {
  const db = getDatabase();
  const result = db.run('DELETE FROM users WHERE id = ?', [id]);
  return result.changes > 0;
}

export async function verifyPassword(
  user: User,
  password: string,
): Promise<boolean> {
  return Bun.password.verify(password, user.password_hash);
}
