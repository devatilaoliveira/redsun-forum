import { Locator, Page } from "@playwright/test";

export class AuthenticatedShellE2e {
  private readonly menuButton: Locator;
  private readonly logoutButton: Locator;

  constructor(private readonly page: Page) {
    this.menuButton = page.getByRole("button", { name: "Toggle menu" });
    this.logoutButton = page.getByTestId("side-nav-logout");
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutButton.click();
  }
}
