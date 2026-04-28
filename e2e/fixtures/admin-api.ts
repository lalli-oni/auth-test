import type { APIRequestContext } from '@playwright/test';
import { ADMIN_ROUTES } from '../constants';

export interface CreateUserPayload {
  username: string;
  password: string;
  email?: string;
}

export interface AdminUserCreated {
  id: number;
  username: string;
  email: string | null;
  createdAt: string;
}

export interface AdminUser extends AdminUserCreated {
  totpEnabled: boolean;
  emailMfaEnabled: boolean;
  passwordPlaintext: string | null;
}

export interface TotpCodeResult {
  code: string;
  remainingSeconds: number;
  totpEnabled: boolean;
}

export interface EmailCodeResult {
  id: number;
  code: string;
  expiresAt: string;
}

async function assertOk(response: { ok(): boolean; status(): number; text(): Promise<string> }, action: string) {
  if (!response.ok()) {
    throw new Error(`${action} failed: ${response.status()} ${await response.text()}`);
  }
}

export const adminApi = {
  async createUser(request: APIRequestContext, payload: CreateUserPayload): Promise<AdminUserCreated> {
    const response = await request.post(ADMIN_ROUTES.USERS, { data: payload });
    await assertOk(response, 'createUser');
    const json = await response.json();
    return json.user;
  },

  async getUser(request: APIRequestContext, userId: number): Promise<AdminUser> {
    const response = await request.get(ADMIN_ROUTES.USER(userId));
    await assertOk(response, 'getUser');
    const json = await response.json();
    return json.user;
  },

  async deleteUser(request: APIRequestContext, userId: number): Promise<void> {
    const response = await request.delete(ADMIN_ROUTES.USER(userId));
    await assertOk(response, 'deleteUser');
  },

  async resetPassword(request: APIRequestContext, userId: number, password: string): Promise<void> {
    const response = await request.post(ADMIN_ROUTES.RESET_PASSWORD(userId), {
      data: { password },
    });
    await assertOk(response, 'resetPassword');
  },

  async getTotpCode(request: APIRequestContext, userId: number): Promise<TotpCodeResult> {
    const response = await request.get(ADMIN_ROUTES.TOTP_CURRENT(userId));
    await assertOk(response, 'getTotpCode');
    const json = await response.json();
    return { code: json.code, remainingSeconds: json.remainingSeconds, totpEnabled: json.totpEnabled };
  },

  async generateEmailCode(request: APIRequestContext, userId: number): Promise<EmailCodeResult> {
    const response = await request.post(ADMIN_ROUTES.EMAIL_CODES(userId));
    await assertOk(response, 'generateEmailCode');
    const json = await response.json();
    return json.code;
  },

  async deleteAllSessions(request: APIRequestContext): Promise<number> {
    const response = await request.delete(ADMIN_ROUTES.SESSIONS);
    await assertOk(response, 'deleteAllSessions');
    const json = await response.json();
    return json.deletedCount;
  },

  async deleteUserSessions(request: APIRequestContext, userId: number): Promise<number> {
    const response = await request.delete(ADMIN_ROUTES.USER_SESSIONS(userId));
    await assertOk(response, 'deleteUserSessions');
    const json = await response.json();
    return json.deletedCount;
  },

  async resetDatabase(request: APIRequestContext): Promise<void> {
    const response = await request.post(ADMIN_ROUTES.RESET_DB);
    await assertOk(response, 'resetDatabase');
  },
};
