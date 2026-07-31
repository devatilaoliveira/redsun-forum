import {expect, Locator, Page, Response} from "@playwright/test";
import {ROUTE_PATHS} from "../../src/interface/constants/route-path.constants";

interface SeededNavigationTarget {
  id: string;
  name: string;
}

interface CreatePostPayload {
  locationId?: unknown;
  content?: unknown;
}

export class PostingPage {
  private readonly postContentInput: Locator;
  private readonly postSubmitButton: Locator;

  constructor(private readonly page: Page) {
    this.postContentInput = page.getByTestId("location-post-content");
    this.postSubmitButton = page.getByTestId("location-post-submit");
  }

  async openLocationFromMyTales(
    tale: SeededNavigationTarget,
    location: SeededNavigationTarget
  ): Promise<void> {
    await this.page.goto(`/${ROUTE_PATHS.myTales}`);
    await expect(this.page).toHaveURL((url) => url.pathname === `/${ROUTE_PATHS.myTales}`);

    const taleCard = this.page.getByRole("button").filter({
      has: this.page.getByRole("heading", {name: tale.name, exact: true})
    });
    await taleCard.click();
    await expect(this.page).toHaveURL((url) =>
      url.pathname === `/${ROUTE_PATHS.tales}/${tale.id}`
    );

    await this.page.getByRole("button", {name: new RegExp(this.escapeRegExp(location.name))}).first().click();
    await expect(this.page).toHaveURL((url) =>
      url.pathname === `/${ROUTE_PATHS.tales}/${tale.id}/${ROUTE_PATHS.locations}/${location.id}`
    );
  }

  async publishTextPost(locationId: string, content: string): Promise<Response> {
    await this.postContentInput.fill(content);

    const createPostResponsePromise = this.page.waitForResponse((response) => {
      const request = response.request();
      const url = new URL(response.url());
      if (request.method() !== "POST" || !url.pathname.endsWith("/posts")) {
        return false;
      }

      let payload: CreatePostPayload;
      try {
        payload = request.postDataJSON() as CreatePostPayload;
      } catch {
        return false;
      }

      return payload.locationId === locationId && payload.content === content;
    });

    await this.postSubmitButton.click();
    return createPostResponsePromise;
  }

  async expectPostVisible(content: string): Promise<void> {
    await expect(
      this.page.locator(".posts-list .post-content").filter({hasText: content})
    ).toHaveText(content);
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
