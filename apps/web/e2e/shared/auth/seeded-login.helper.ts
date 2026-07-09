import { Page, expect } from "@playwright/test";
import { LoginViewE2e } from "../../login-view/login.view.page";

interface SeededCredentials {
  email: string;
  password: string;
}

export async function loginWithSeededUser(page: Page, credentials: SeededCredentials): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  const loginView = new LoginViewE2e(page);
  await loginView.navigateToLoginView();

  const sessionEstablishedRequestPromise = page.waitForRequest("**/authentication/session-established");
  await loginView.login(credentials.email, credentials.password);

  await sessionEstablishedRequestPromise;
  await expect(page).toHaveURL((url) => url.pathname === "/");
  await expect.poll(() => loginView.getStoredUser()).not.toBeNull();
}
