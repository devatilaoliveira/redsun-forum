import { expect } from "@playwright/test";
import { ROUTE_PATHS } from "../../src/interface/constants/route-path.constants";
import { test } from "./register.view.fixture";

test.describe("Register workflow", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test("should require legal acceptance before registration", async ({
    page,
    registerViewE2e,
    registerTestUser,
  }) => {
    await registerViewE2e.fillEmail(registerTestUser.email);
    await registerViewE2e.fillPassword(registerTestUser.password);
    await registerViewE2e.fillConfirmPassword(registerTestUser.password);

    await expect.poll(() => registerViewE2e.isAcceptedLegalChecked()).toBe(false);
    await expect.poll(() => registerViewE2e.isAcceptedLegalRequiredMissing()).toBe(true);
    await expect.poll(() => registerViewE2e.isSubmitDisabled()).toBe(true);
    await expect(page).toHaveURL((url) => url.pathname === `/${ROUTE_PATHS.register}`);

    await registerViewE2e.acceptLegal();

    await expect.poll(() => registerViewE2e.isAcceptedLegalChecked()).toBe(true);
    await expect.poll(() => registerViewE2e.isSubmitDisabled()).toBe(false);
  });

  test("should navigate to terms and privacy documents from legal consent", async ({ page, registerViewE2e }) => {
    await registerViewE2e.openTermsFromLegalConsent();
    await expect(page).toHaveURL((url) => url.pathname === `/${ROUTE_PATHS.terms}`);

    await registerViewE2e.navigateToRegisterView();
    await registerViewE2e.openPrivacyFromLegalConsent();
    await expect(page).toHaveURL((url) => url.pathname === `/${ROUTE_PATHS.privacy}`);
  });

  test("should verify registration and redirect to auth verified", async ({
    e2eTestApi,
    page,
    registerViewE2e,
    registerTestUser,
  }) => {
    const registrationRequestPromise = registerViewE2e.waitForRegistrationRequest();

    registerTestUser.markForCleanup();
    await registerViewE2e.register(registerTestUser.email, registerTestUser.password);

    const registrationRequest = await registrationRequestPromise;
    expect(registrationRequest.postDataJSON()).toEqual({
      email: registerTestUser.email,
      password: registerTestUser.password,
      acceptedTerms: true,
      acknowledgedPrivacy: true,
    });

    await registerViewE2e.waitForVerificationCodeInput();
    const verificationCode = await e2eTestApi.getVerificationCode(registerTestUser.email);

    await registerViewE2e.fillVerificationCode(verificationCode);

    await expect.poll(() => registerViewE2e.getVerificationCodeInputValue()).toBe(verificationCode);

    const verifyEmailCodeRequestPromise = registerViewE2e.waitForVerifyEmailCodeRequest();

    await registerViewE2e.submitVerificationCode();

    const verifyEmailCodeRequest = await verifyEmailCodeRequestPromise;
    expect(verifyEmailCodeRequest.postDataJSON()).toEqual({
      email: registerTestUser.email,
      code: verificationCode,
    });
    await expect(page).toHaveURL((url) => url.pathname === `/${ROUTE_PATHS.authVerified}`);
  });
});
