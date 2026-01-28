import { getDatabase } from "../db/database";

export interface User {
  id: number;
  username: string;
  email: string | null;
  password_hash: string;
  totp_enabled: number;
  totp_secret: string | null;
  email_mfa_enabled: number;
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

export async function createUser(input: CreateUserInput): Promise<User> {
  const db = getDatabase();
  const passwordHash = await Bun.password.hash(input.password);

  const result = db.run(
    "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
    [input.username, input.email || null, passwordHash]
  );

  return getUserById(Number(result.lastInsertRowid))!;
}

export function getUserById(id: number): User | null {
  const db = getDatabase();
  return db.query("SELECT * FROM users WHERE id = ?").get(id) as User | null;
}

export function getUserByUsername(username: string): User | null {
  const db = getDatabase();
  return db.query("SELECT * FROM users WHERE username = ?").get(username) as User | null;
}

export function getAllUsers(): User[] {
  const db = getDatabase();
  return db.query("SELECT * FROM users ORDER BY created_at DESC").all() as User[];
}

export function updateUser(id: number, input: UpdateUserInput): User | null {
  const db = getDatabase();
  const updates: string[] = [];
  const values: any[] = [];

  if (input.username !== undefined) {
    updates.push("username = ?");
    values.push(input.username);
  }
  if (input.email !== undefined) {
    updates.push("email = ?");
    values.push(input.email);
  }
  if (input.totp_enabled !== undefined) {
    updates.push("totp_enabled = ?");
    values.push(input.totp_enabled ? 1 : 0);
  }
  if (input.totp_secret !== undefined) {
    updates.push("totp_secret = ?");
    values.push(input.totp_secret);
  }
  if (input.email_mfa_enabled !== undefined) {
    updates.push("email_mfa_enabled = ?");
    values.push(input.email_mfa_enabled ? 1 : 0);
  }

  if (updates.length === 0) {
    return getUserById(id);
  }

  values.push(id);
  db.run(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);

  return getUserById(id);
}

export async function updatePassword(id: number, newPassword: string): Promise<void> {
  const db = getDatabase();
  const passwordHash = await Bun.password.hash(newPassword);
  db.run("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, id]);
}

export function deleteUser(id: number): boolean {
  const db = getDatabase();
  const result = db.run("DELETE FROM users WHERE id = ?", [id]);
  return result.changes > 0;
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return Bun.password.verify(password, user.password_hash);
}
