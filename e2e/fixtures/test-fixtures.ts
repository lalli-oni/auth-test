import { test as base } from '@playwright/test';
import { adminApi, type AdminUser } from './admin-api';
import { TEST_DEFAULTS } from '../constants';

export type TestFixtures = {
  testUser: AdminUser & { password: string };
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
    } catch {
      // ignore cleanup errors
    }
  },
});

export { expect } from '@playwright/test';
