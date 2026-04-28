import { test as base } from '@playwright/test';
import { adminApi, type AdminUser } from './admin-api';
import { TEST_DEFAULTS } from '../constants';

export type TestFixtures = {
  testUser: AdminUser & { password: string };
};

export const test = base.extend<TestFixtures>({
  testUser: async ({ request }, use) => {
    const password = TEST_DEFAULTS.PASSWORD;
    const user = await adminApi.createUser(request, {
      username: `test_${Date.now()}`,
      password,
      email: `test_${Date.now()}@example.com`,
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
