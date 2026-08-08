import {expect} from "@playwright/test";
import {SEEDED_DATA} from "../shared/config/seeded-data.config";
import {test} from "./posting.fixture";
import {PostingPage} from "./posting.page";

test.describe("Participant posting with seeded backend data", () => {
  test("publishes a text post to a campaign location", async ({page}, testInfo) => {
    const postingPage = new PostingPage(page);
    const content = `E2E participant post ${testInfo.project.name} ${Date.now()}`;

    await postingPage.openLocationFromMyTales(
      SEEDED_DATA.SEEDED_TALE,
      SEEDED_DATA.SEEDED_LOCATION
    );

    const createResponse = await postingPage.publishTextPost(
      SEEDED_DATA.SEEDED_LOCATION.id,
      content
    );

    expect(createResponse.status()).toBe(201);
    await postingPage.expectPostVisible(content);
  });
});
