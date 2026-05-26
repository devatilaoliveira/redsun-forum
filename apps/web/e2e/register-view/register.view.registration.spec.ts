import { expect, Page, Route } from "@playwright/test";
import { ROUTE_PATHS } from "../../src/interface/constants/route-path.constants";
import { test } from "./register.view.fixture";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
};

const isSupabaseSignUp = (url: URL): boolean => url.pathname.endsWith("/auth/v1/signup");

async function mockSupabaseSignUp(page: Page, email: string): Promise<void> {
  await page.route(isSupabaseSignUp, async (route: Route) => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: CORS_HEADERS });
      return;
    }

    const now = new Date().toISOString();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: CORS_HEADERS,
      body: JSON.stringify({
        id: "00000000-0000-4000-8000-000000000002",
        aud: "authenticated",
        role: "authenticated",
        email,
        confirmation_sent_at: now,
        app_metadata: {
          provider: "email",
          providers: ["email"],
        },
        user_metadata: {},
        identities: [],
        created_at: now,
        updated_at: now,
      }),
    });
  });
}

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

  test("should request Supabase signup and show email confirmation message", async ({
    page,
    registerViewE2e,
    registerTestUser,
  }) => {
    await mockSupabaseSignUp(page, registerTestUser.email);
    const signUpRequestPromise = registerViewE2e.waitForSupabaseSignUpRequest();

    await registerViewE2e.register(registerTestUser.email, registerTestUser.password);

    const signUpRequest = await signUpRequestPromise;
    const signUpUrl = new URL(signUpRequest.url());
    expect(signUpRequest.postDataJSON()).toEqual(expect.objectContaining({
      email: registerTestUser.email,
      password: registerTestUser.password,
    }));
    expect(signUpUrl.searchParams.get("redirect_to")).toContain(`/${ROUTE_PATHS.authVerified}`);

    await registerViewE2e.waitForCheckEmailMessage();
    await expect(page).toHaveURL((url) => url.pathname === `/${ROUTE_PATHS.register}`);
  });
});
