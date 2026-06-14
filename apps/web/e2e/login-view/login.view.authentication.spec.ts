import { expect } from "@playwright/test";
import { ROUTE_PATHS } from "../../src/interface/constants/route-path.constants";
import {
  buildUser,
  mockRedSunPostLogin,
  mockSupabasePasswordSignIn,
  waitForSupabasePasswordSignInRequest,
} from "../shared/auth/authentication.mock";
import { test } from "./login.view.fixture";

test.describe("Login authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test("should login with email and password", async ({ page, loginViewE2e, testProfile }) => {
    const currentUser = buildUser(testProfile.email, true);
    await mockSupabasePasswordSignIn(page, testProfile.email);
    await mockRedSunPostLogin(page, currentUser);

    const signInRequestPromise = waitForSupabasePasswordSignInRequest(page);
    const sessionEstablishedRequestPromise = page.waitForRequest("**/authentication/session-established");

    await loginViewE2e.login(testProfile.email, testProfile.password);

    const signInRequest = await signInRequestPromise;
    expect(signInRequest.postDataJSON()).toEqual(expect.objectContaining({
      email: testProfile.email,
      password: testProfile.password,
    }));

    const sessionEstablishedRequest = await sessionEstablishedRequestPromise;
    expect(sessionEstablishedRequest.headers()["authorization"]).toBe("Bearer e2e-supabase-access-token");
    await expect(page).toHaveURL((url) => url.pathname === "/");
    await expect.poll(() => loginViewE2e.getStoredUser()).not.toBeNull();
  });

  test("should require current terms and privacy acknowledgement after login", async ({
    page,
    loginViewE2e,
    legalAcceptanceViewE2e,
    testProfile,
  }) => {
    const outdatedUser = buildUser(testProfile.email, false);
    const currentUser = buildUser(testProfile.email, true);
    await mockSupabasePasswordSignIn(page, testProfile.email);
    await mockRedSunPostLogin(page, outdatedUser);
    await page.route("**/user/me/legal-acknowledgement", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(currentUser),
      });
    });

    const signInRequestPromise = waitForSupabasePasswordSignInRequest(page);

    await loginViewE2e.login(testProfile.email, testProfile.password);

    const signInRequest = await signInRequestPromise;
    expect(signInRequest.postDataJSON()).toEqual(expect.objectContaining({
      email: testProfile.email,
      password: testProfile.password,
    }));

    await expect(page).toHaveURL((url) =>
      url.pathname === `/${ROUTE_PATHS.legalAcceptance}` && url.searchParams.get("returnUrl") === "/",
    );
    await expect.poll(() => legalAcceptanceViewE2e.isSubmitDisabled()).toBe(true);

    await legalAcceptanceViewE2e.acceptTerms();
    await expect.poll(() => legalAcceptanceViewE2e.isTermsAccepted()).toBe(true);
    await expect.poll(() => legalAcceptanceViewE2e.isSubmitDisabled()).toBe(true);

    await legalAcceptanceViewE2e.acknowledgePrivacy();
    await expect.poll(() => legalAcceptanceViewE2e.isPrivacyAcknowledged()).toBe(true);
    await expect.poll(() => legalAcceptanceViewE2e.isSubmitDisabled()).toBe(false);

    const legalAcknowledgementRequestPromise = legalAcceptanceViewE2e.waitForLegalAcknowledgementRequest();

    await legalAcceptanceViewE2e.submit();

    const legalAcknowledgementRequest = await legalAcknowledgementRequestPromise;
    expect(legalAcknowledgementRequest.postDataJSON()).toEqual({
      acceptedTerms: true,
      acknowledgedPrivacy: true,
    });
    await expect(page).toHaveURL((url) => url.pathname === "/");
  });
});
