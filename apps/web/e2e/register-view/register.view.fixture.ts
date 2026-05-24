import { test as base } from "../shared/fixtures/e2e-test-api.fixture";
import { RegisterTestUser } from "../shared/models/RegisterTestUser";
import { buildUniqueTestUserEmail } from "../shared/utils/test-user.utils";
import { RegisterViewE2e } from "./register.view.page";

const USER_PASSWORD = "123456789";

export const test = base.extend<{
  registerViewE2e: RegisterViewE2e;
  registerTestUser: RegisterTestUser;
}>({
  registerTestUser: async ({ e2eTestApi }, use, testInfo) => {
    const emailsToCleanup = new Set<string>();
    const email = buildUniqueTestUserEmail(testInfo);
    const user: RegisterTestUser = {
      email,
      password: USER_PASSWORD,
      markForCleanup: () => {
        emailsToCleanup.add(email);
      },
    };

    await use(user);

    try {
      await e2eTestApi.deleteUsersByEmail([...emailsToCleanup]);
    } catch (error) {
      if (testInfo.status === testInfo.expectedStatus) {
        throw error;
      }

      console.warn(`Failed to clean up registered test user after failed test: ${String(error)}`);
    }
  },
  registerViewE2e: async ({ page }, use) => {
    const registerViewE2e = new RegisterViewE2e(page);
    await registerViewE2e.navigateToRegisterView();
    await use(registerViewE2e);
  },
});
