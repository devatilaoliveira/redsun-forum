import { test as base } from "@playwright/test";
import { E2eTestApi } from "../api/e2e-test.api";

export const test = base.extend<{
  e2eTestApi: E2eTestApi;
}>({
  e2eTestApi: async ({ request }, use) => {
    await use(new E2eTestApi(request));
  },
});
