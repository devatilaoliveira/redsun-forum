import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { test as base } from "@playwright/test";
import { SEEDED_DATA } from "../shared/config/seeded-data.config";
import { loginWithSeededUser } from "../shared/auth/seeded-login.helper";

export const test = base.extend<
  object,
  {
    seededOwnerStorageState: string;
  }
>({
  seededOwnerStorageState: [async ({ browser }, use, workerInfo) => {
    const storageStatePath = join(
      workerInfo.project.outputDir,
      ".auth",
      `seeded-owner-${workerInfo.workerIndex}.json`,
    );
    mkdirSync(dirname(storageStatePath), { recursive: true });

    const page = await browser.newPage({
      baseURL: workerInfo.project.use.baseURL as string | undefined,
    });
    try {
      await loginWithSeededUser(page, SEEDED_DATA.SEEDED_TALE_OWNER);
      await page.context().storageState({ path: storageStatePath });
    } finally {
      await page.close();
    }

    await use(storageStatePath);
  }, { scope: "worker" }],

  storageState: async ({ seededOwnerStorageState }, use) => {
    await use(seededOwnerStorageState);
  },
});
