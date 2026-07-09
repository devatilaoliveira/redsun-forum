import { Locator, Page, Response, expect } from "@playwright/test";
import { ROUTE_PATHS } from "../../src/interface/constants/route-path.constants";
import { hasMultipartField } from "../shared/utils/multipart-request.utils";

export class LocationFormPage {
  private readonly page: Page;
  private readonly nameInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByTestId("location-form-name-input");
    this.descriptionInput = page.getByTestId("location-form-description-input");
    this.submitButton = page.getByTestId("location-form-submit");
  }

  async goto(taleId: string): Promise<void> {
    await this.page.goto(`/${ROUTE_PATHS.tales}/${taleId}/${ROUTE_PATHS.locations}/${ROUTE_PATHS.creation}`);
  }

  async createLocation(taleId: string, name: string, description: string): Promise<Response> {
    await this.nameInput.fill(name);
    await this.descriptionInput.fill(description);

    const createLocationResponsePromise = this.page.waitForResponse((response) => {
      const url = new URL(response.url());
      const request = response.request();
      return request.method() === "POST" &&
        url.pathname.endsWith(`/${ROUTE_PATHS.locations}`) &&
        hasMultipartField(request, "taleId", taleId) &&
        hasMultipartField(request, "locationName", name);
    });

    await this.submitButton.click();
    return createLocationResponsePromise;
  }

  async expectCreatedLocationVisible(taleId: string, locationId: string, locationName: string): Promise<void> {
    await expect(this.page).toHaveURL((url) =>
      url.pathname === `/${ROUTE_PATHS.tales}/${taleId}/${ROUTE_PATHS.locations}/${locationId}`,
    );
    await expect(this.page.getByRole("heading", { name: locationName })).toBeVisible();
  }
}
