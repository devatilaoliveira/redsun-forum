/* eslint-disable no-empty-pattern */
import { test as base } from "@playwright/test";
import { RegisterTestUser } from "../shared/models/RegisterTestUser";
import { buildUniqueTestUserEmail } from "../shared/utils/test-user.utils";
import { RegisterViewE2e } from "./register.view.page";

const USER_PASSWORD = "123456789";

export const test = base.extend<{
  registerViewE2e: RegisterViewE2e;
  registerTestUser: RegisterTestUser;
}>({
  registerTestUser: async ({}, use, testInfo) => {
    const email = buildUniqueTestUserEmail(testInfo);
    const user: RegisterTestUser = {
      email,
      password: USER_PASSWORD,
    };

    await use(user);
  },
  registerViewE2e: async ({ page }, use) => {
    const registerViewE2e = new RegisterViewE2e(page);
    await registerViewE2e.navigateToRegisterView();
    await use(registerViewE2e);
  },
});
