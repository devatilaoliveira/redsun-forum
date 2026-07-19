import { Locator, Page, Response, expect } from "@playwright/test";
import { ROUTE_PATHS } from "../../src/interface/constants/route-path.constants";

export class ManageParticipantsPage {
  private readonly page: Page;
  private readonly identifierInput: Locator;
  private readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.identifierInput = page.getByTestId("manage-participants-identifier-input");
    this.submitButton = page.getByTestId("manage-participants-add-submit");
  }

  async goto(taleId: string): Promise<void> {
    await this.page.goto(`/${ROUTE_PATHS.tales}/${taleId}/${ROUTE_PATHS.manage}/${ROUTE_PATHS.participants}`);
  }

  async addParticipant(taleId: string, identifier: string): Promise<Response> {
    await this.identifierInput.fill(identifier);

    const addParticipantResponsePromise = this.page.waitForResponse((response) => {
      const url = new URL(response.url());
      return response.request().method() === "POST" &&
        url.pathname.endsWith(
          `/${ROUTE_PATHS.tales}/${taleId}/${ROUTE_PATHS.participants}/${encodeURIComponent(identifier)}`,
        );
    });

    await this.submitButton.click();
    return addParticipantResponsePromise;
  }

  async expectParticipantRowVisible(participantId: string): Promise<void> {
    await expect(this.page.getByTestId(`manage-participants-row-${participantId}`)).toBeVisible();
  }

  async expectParticipantRowHidden(participantId: string): Promise<void> {
    await expect(this.page.getByTestId(`manage-participants-row-${participantId}`)).toBeHidden();
  }
}
