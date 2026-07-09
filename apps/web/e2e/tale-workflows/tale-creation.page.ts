import { Locator, Page, Response, expect } from "@playwright/test";
import { ROUTE_PATHS } from "../../src/interface/constants/route-path.constants";
import { hasMultipartField } from "../shared/utils/multipart-request.utils";

export class TaleCreationPage {
  private readonly page: Page;
  private readonly nameInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByTestId("tale-create-name-input");
    this.descriptionInput = page.getByTestId("tale-create-description-input");
    this.submitButton = page.getByTestId("tale-create-submit");
  }

  async goto(): Promise<void> {
    await this.page.goto(`/${ROUTE_PATHS.tales}/${ROUTE_PATHS.create}`);
  }

  async createTale(name: string, description: string): Promise<Response> {
    await this.nameInput.fill(name);
    await this.descriptionInput.fill(description);

    const createTaleResponsePromise = this.page.waitForResponse((response) => {
      const url = new URL(response.url());
      const request = response.request();
      return request.method() === "POST" &&
        url.pathname.endsWith(`/${ROUTE_PATHS.tales}/${ROUTE_PATHS.create}`) &&
        hasMultipartField(request, "taleName", name);
    });

    await this.submitButton.click();
    return createTaleResponsePromise;
  }

  async expectCreatedTaleVisible(taleId: string, taleName: string): Promise<void> {
    await expect(this.page).toHaveURL((url) => url.pathname === `/${ROUTE_PATHS.tales}/${taleId}`);
    await expect(this.page.getByText(taleName, { exact: true })).toBeVisible();
  }

  async expectCreatedTaleVisibleByUrl(taleName: string): Promise<string> {
    await expect(this.page).toHaveURL((url) => {
      const pathPattern = new RegExp(`^/${ROUTE_PATHS.tales}/[^/]+$`);
      return pathPattern.test(url.pathname);
    });
    await expect(this.page.getByText(taleName, { exact: true })).toBeVisible();

    return new URL(this.page.url()).pathname.split("/").at(-1)!;
  }
}
