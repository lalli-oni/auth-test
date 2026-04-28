import { test as base } from '@playwright/test';
import { adminApi, type AdminUserCreated } from './admin-api';
import { TEST_DEFAULTS } from '../constants';

export type TestFixtures = {
  testUser: AdminUserCreated & { password: string };
};

export const test = base.extend<TestFixtures>({
  testUser: async ({ request }, use) => {
    const password = TEST_DEFAULTS.PASSWORD;
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const user = await adminApi.createUser(request, {
      username: `test_${id}`,
      password,
      email: `test_${id}@example.com`,
    });

    await use({ ...user, password });

    try {
      await adminApi.deleteUser(request, user.id);
    } catch (error) {
      console.warn(`[testUser cleanup] Failed to delete user ${user.id} (${user.username}):`, error);
    }
  },
});

export { expect } from '@playwright/test';
