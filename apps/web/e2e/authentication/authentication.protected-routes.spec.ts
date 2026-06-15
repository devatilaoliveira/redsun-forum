import { expect, test } from "@playwright/test";
import { ROUTE_PATHS } from "../../src/interface/constants/route-path.constants";
import { SEEDED_DATA } from "../shared/config/seeded-data.config";
import { LoginViewE2e } from "../login-view/login.view.page";
import { AuthenticatedShellE2e } from "./authenticated-shell.page";

const PRIVATE_ROUTES = [
  `/${ROUTE_PATHS.settings}`,
  `/${ROUTE_PATHS.myTales}`,
] as const;

test.describe("Protected routes", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  for (const privateRoute of PRIVATE_ROUTES) {
    test(`should redirect logged out users from ${privateRoute} to login`, async ({ page }) => {
      const loginViewE2e = new LoginViewE2e(page);

      await page.goto(privateRoute);

      await expect(page).toHaveURL((url) => url.pathname === `/${ROUTE_PATHS.login}`);
      await expect.poll(() => loginViewE2e.isEmailInputVisible()).toBe(true);
      await expect.poll(() => loginViewE2e.getStoredUser()).toBeNull();
    });
  }

  test("should not restore the old session after logout and reload", async ({ page }) => {
    const loginViewE2e = new LoginViewE2e(page);
    await loginViewE2e.navigateToLoginView();

    await loginViewE2e.login(
      SEEDED_DATA.SEEDED_LOGIN_USER.email,
      SEEDED_DATA.SEEDED_LOGIN_USER.password,
    );

    await expect(page).toHaveURL((url) => url.pathname === "/");
    await expect.poll(() => loginViewE2e.getStoredUser()).not.toBeNull();

    const authenticatedShellE2e = new AuthenticatedShellE2e(page);

    await authenticatedShellE2e.logout();

    await expect(page).toHaveURL((url) => url.pathname === `/${ROUTE_PATHS.login}`);
    await expect.poll(() => loginViewE2e.getStoredUser()).toBeNull();

    await page.reload();
    await expect(page).toHaveURL((url) => url.pathname === `/${ROUTE_PATHS.login}`);
    await expect.poll(() => loginViewE2e.isEmailInputVisible()).toBe(true);

    await page.goto(`/${ROUTE_PATHS.settings}`);

    await expect(page).toHaveURL((url) => url.pathname === `/${ROUTE_PATHS.login}`);
    await expect.poll(() => loginViewE2e.getStoredUser()).toBeNull();
  });
});
