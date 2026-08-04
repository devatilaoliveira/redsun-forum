import {dirname, join} from "node:path";
import {mkdirSync} from "node:fs";
import {test as base} from "@playwright/test";
import {loginWithSeededUser} from "../shared/auth/seeded-login.helper";
import {SEEDED_DATA} from "../shared/config/seeded-data.config";

export const test = base.extend<
  object,
  {
    seededVisitorStorageState: string;
  }
>({
  seededVisitorStorageState: [async ({browser}, use, workerInfo) => {
    const storageStatePath = join(
      workerInfo.project.outputDir,
      ".auth",
      `seeded-visitor-${workerInfo.workerIndex}.json`
    );
    mkdirSync(dirname(storageStatePath), {recursive: true});

    const page = await browser.newPage({
      baseURL: workerInfo.project.use.baseURL as string | undefined
    });
    try {
      // Worker 2 is not a member of the public tale used by this access test.
      await loginWithSeededUser(page, SEEDED_DATA.SEEDED_TALE_PARTICIPANT);
      await page.context().storageState({path: storageStatePath});
    } finally {
      await page.close();
    }

    await use(storageStatePath);
  }, {scope: "worker"}],

  storageState: async ({seededVisitorStorageState}, use) => {
    await use(seededVisitorStorageState);
  }
});
