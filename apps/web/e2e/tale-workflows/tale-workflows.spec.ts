import { expect } from "@playwright/test";
import { SEEDED_DATA } from "../shared/config/seeded-data.config";
import { LocationFormPage } from "./location-form.page";
import { ManageParticipantsPage } from "./manage-participants.page";
import { TaleCreationPage } from "./tale-creation.page";
import { test } from "./tale-workflows.fixture";

test.describe("Tale workflows with seeded backend data", () => {
  test("creates a new tale as a pre-existing user", async ({ page }) => {
    const taleCreation = new TaleCreationPage(page);
    const uniqueName = `E2E Created Tale ${Date.now()}`;

    await taleCreation.goto();
    const createResponse = await taleCreation.createTale(uniqueName, "Created by a full browser E2E test.");

    expect(createResponse.ok()).toBe(true);
    const createdTale = await createResponse.json();
    expect(createdTale.id).toEqual(expect.any(String));
    expect(createdTale.taleName).toBe(uniqueName);
    await taleCreation.expectCreatedTaleVisible(createdTale.id, uniqueName);
  });

  test("adds a pre-existing participant to a pre-existing tale", async ({ page }) => {
    const participantsPage = new ManageParticipantsPage(page);
    const tale = SEEDED_DATA.SEEDED_TALE;
    const participant = SEEDED_DATA.SEEDED_TALE_PARTICIPANT;

    await participantsPage.goto(tale.id);
    await participantsPage.expectParticipantRowHidden(participant.id);

    const addResponse = await participantsPage.addParticipant(tale.id, participant.email);

    expect(addResponse.ok()).toBe(true);
    const updatedTale = await addResponse.json();
    expect(updatedTale.participants).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: participant.id,
          username: participant.username,
        }),
      ]),
    );
    await participantsPage.expectParticipantRowVisible(participant.id);
  });

  test("creates a new location in a pre-existing tale as tale owner", async ({ page }) => {
    const locationForm = new LocationFormPage(page);
    const tale = SEEDED_DATA.SEEDED_TALE;
    const uniqueName = `E2E Created Location ${Date.now()}`;

    await locationForm.goto(tale.id);
    const createResponse = await locationForm.createLocation(tale.id, uniqueName, "Created by a full browser E2E test.");

    expect(createResponse.ok()).toBe(true);
    const createdLocation = await createResponse.json();
    expect(createdLocation.id).toEqual(expect.any(String));
    expect(createdLocation.locationName).toBe(uniqueName);
    await locationForm.expectCreatedLocationVisible(tale.id, createdLocation.id, uniqueName);
  });
});
