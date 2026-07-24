import { expect } from "@playwright/test";
import { ROUTE_PATHS } from "../../src/interface/constants/route-path.constants";
import { AuthenticatedShellE2e } from "../authentication/authenticated-shell.page";
import { LegalAcceptanceViewE2e } from "../login-view/legal-acceptance.view.page";
import { LoginViewE2e } from "../login-view/login.view.page";
import { waitForSupabaseConfirmationUrl } from "../shared/mailpit/mailpit.helper";
import { test } from "./register.view.fixture";

test.describe("Full registration workflow", () => {
  test("should confirm email, accept legal documents, logout, and login", async ({
    page,
    request,
    registerViewE2e,
    registerTestUser,
  }) => {
    const legalAcceptanceViewE2e = new LegalAcceptanceViewE2e(page);
    const authenticatedShellE2e = new AuthenticatedShellE2e(page);
    const loginViewE2e = new LoginViewE2e(page);

    await registerViewE2e.register(registerTestUser.email, registerTestUser.password);
    await registerViewE2e.waitForCheckEmailMessage();
    await expect(page).toHaveURL((url) => url.pathname === `/${ROUTE_PATHS.register}`);

    const confirmationUrl = await waitForSupabaseConfirmationUrl(request, registerTestUser.email);
    const confirmationResponsePromise = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return url.pathname.endsWith("/auth/v1/verify") && url.searchParams.get("type") === "signup";
    });
    const userCreationResponsePromise = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return response.request().method() === "POST" && url.pathname.endsWith("/user/me");
    });

    await page.goto(confirmationUrl);

    const confirmationResponse = await confirmationResponsePromise;
    expect(confirmationResponse.status()).toBeLessThan(400);
    const confirmationRedirect = new URL(confirmationResponse.headers()["location"]);
    expect(confirmationRedirect.pathname).toBe(`/${ROUTE_PATHS.authVerified}`);
    expect(confirmationRedirect.searchParams.get("code")).not.toBeNull();
    const userCreationResponse = await userCreationResponsePromise;
    expect(userCreationResponse.ok()).toBe(true);
    await expect(page).toHaveURL((url) =>
      url.pathname === `/${ROUTE_PATHS.legalAcceptance}` &&
      url.searchParams.get("returnUrl") === "/",
    );

    await expect.poll(() => legalAcceptanceViewE2e.isTermsAccepted()).toBe(false);
    await expect.poll(() => legalAcceptanceViewE2e.isPrivacyAcknowledged()).toBe(false);
    await expect.poll(() => legalAcceptanceViewE2e.isSubmitDisabled()).toBe(true);

    await legalAcceptanceViewE2e.acceptTerms();
    await expect.poll(() => legalAcceptanceViewE2e.isTermsAccepted()).toBe(true);
    await expect.poll(() => legalAcceptanceViewE2e.isSubmitDisabled()).toBe(true);

    await legalAcceptanceViewE2e.acknowledgePrivacy();
    await expect.poll(() => legalAcceptanceViewE2e.isPrivacyAcknowledged()).toBe(true);
    await expect.poll(() => legalAcceptanceViewE2e.isSubmitDisabled()).toBe(false);

    const legalAcknowledgementRequestPromise =
      legalAcceptanceViewE2e.waitForLegalAcknowledgementRequest();
    await legalAcceptanceViewE2e.submit();

    const legalAcknowledgementRequest = await legalAcknowledgementRequestPromise;
    expect(legalAcknowledgementRequest.postDataJSON()).toEqual({
      acceptedTerms: true,
      acknowledgedPrivacy: true,
    });
    await expect(page).toHaveURL((url) => url.pathname === "/");
    await expect.poll(() => authenticatedShellE2e.isVisible()).toBe(true);

    await authenticatedShellE2e.logout();
    await expect(page).toHaveURL((url) => url.pathname === `/${ROUTE_PATHS.login}`);
    await expect.poll(() => loginViewE2e.getStoredUser()).toBeNull();

    const postLoginPaths: string[] = [];
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) {
        postLoginPaths.push(new URL(frame.url()).pathname);
      }
    });
    const signInRequestPromise = page.waitForRequest((request) => {
      const url = new URL(request.url());
      return request.method() === "POST" && url.pathname.endsWith("/auth/v1/token");
    });
    await loginViewE2e.login(registerTestUser.email, registerTestUser.password);

    const signInRequest = await signInRequestPromise;
    expect(signInRequest.postDataJSON()).toEqual(expect.objectContaining({
      email: registerTestUser.email,
      password: registerTestUser.password,
    }));
    await expect(page).toHaveURL((url) => url.pathname === "/");
    expect(postLoginPaths).not.toContain(`/${ROUTE_PATHS.legalAcceptance}`);
    await expect.poll(() => authenticatedShellE2e.isVisible()).toBe(true);
  });
});
