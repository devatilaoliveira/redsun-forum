import {SEEDED_DATA} from "../shared/config/seeded-data.config";
import {test} from "./tale-access.fixture";
import {TaleAccessPage} from "./tale-access.page";

test.describe("Public tale visitor access", () => {
  test("can view a member character sheet without seeing participation menus", async ({page}) => {
    const taleAccess = new TaleAccessPage(page);
    const tale = SEEDED_DATA.SEEDED_TALE;
    const owner = SEEDED_DATA.SEEDED_TALE_OWNER;

    await taleAccess.gotoTale(tale.id);
    await taleAccess.expectParticipationMenusHidden();

    await taleAccess.gotoCharacterProfile(tale.id, owner.id);
    await taleAccess.expectCharacterVisible("no_given_name_yet");
    await taleAccess.expectParticipationMenusHidden();
  });
});
