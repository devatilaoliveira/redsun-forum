import {expect, Locator, Page} from "@playwright/test";
import {ROUTE_PATHS} from "../../src/interface/constants/route-path.constants";

export class TaleAccessPage {
  private readonly manageTaleButton: Locator;
  private readonly playerMenuButton: Locator;

  constructor(private readonly page: Page) {
    this.manageTaleButton = page.getByRole("button", {name: "Manage tale"});
    this.playerMenuButton = page.getByRole("button", {name: "Player menu"});
  }

  async gotoTale(taleId: string): Promise<void> {
    await this.page.goto(`/${ROUTE_PATHS.tales}/${taleId}`);
    await expect(this.page).toHaveURL((url) => url.pathname === `/${ROUTE_PATHS.tales}/${taleId}`);
  }

  async expectParticipationMenusHidden(): Promise<void> {
    await expect(this.manageTaleButton).toHaveCount(0);
    await expect(this.playerMenuButton).toHaveCount(0);
  }

  async gotoCharacterProfile(taleId: string, participantId: string): Promise<void> {
    const profilePath = `/${ROUTE_PATHS.tales}/${taleId}/${ROUTE_PATHS.participants}/${participantId}`;
    await this.page.goto(profilePath);
    await expect(this.page).toHaveURL((url) => url.pathname === profilePath);
  }

  async expectCharacterVisible(characterName: string): Promise<void> {
    await expect(this.page.getByRole("heading", {name: characterName})).toBeVisible();
  }
}
