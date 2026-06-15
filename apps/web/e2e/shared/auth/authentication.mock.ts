import { Page, Route } from "@playwright/test";
import { MeResponseDTO } from "../../../src/interface/dtos/user/MeResponseDTO";
import { EProvider } from "../../../src/interface/enums/EProvider";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
};

export const buildUser = (email: string, currentLegalAcknowledgement: boolean): MeResponseDTO => ({
  id: "e2e-login-user",
  username: "e2e-login-user",
  email,
  provider: EProvider.EMAIL,
  imageURL: "",
  favoriteLanguage: [],
  favoriteRules: [],
  favoriteRole: [],
  contacts: [],
  legalAcknowledgement: {
    termsAccepted: currentLegalAcknowledgement,
    privacyAcknowledged: currentLegalAcknowledgement,
    current: currentLegalAcknowledgement,
    termsVersion: currentLegalAcknowledgement ? "current-terms" : null,
    privacyVersion: currentLegalAcknowledgement ? "current-privacy" : null,
    requiredTermsVersion: "current-terms",
    requiredPrivacyVersion: "current-privacy",
  },
});

const buildSupabasePasswordSession = (email: string) => {
  const now = new Date().toISOString();

  return {
    access_token: "e2e-supabase-access-token",
    token_type: "bearer",
    expires_in: 3600,
    refresh_token: "e2e-supabase-refresh-token",
    user: {
      id: "00000000-0000-4000-8000-000000000001",
      aud: "authenticated",
      role: "authenticated",
      email,
      email_confirmed_at: now,
      confirmed_at: now,
      last_sign_in_at: now,
      app_metadata: {
        provider: "email",
        providers: ["email"],
      },
      user_metadata: {},
      identities: [],
      created_at: now,
      updated_at: now,
    },
  };
};

const isSupabasePasswordSignIn = (url: URL): boolean =>
  url.pathname.endsWith("/auth/v1/token") && url.searchParams.get("grant_type") === "password";

const isSupabaseSignOut = (url: URL): boolean => url.pathname.endsWith("/auth/v1/logout");

export const waitForSupabasePasswordSignInRequest = (page: Page) =>
  page.waitForRequest((request) => {
    const url = new URL(request.url());
    return request.method() === "POST" && isSupabasePasswordSignIn(url);
  });

export const waitForSupabaseSignOutRequest = (page: Page) =>
  page.waitForRequest((request) => {
    const url = new URL(request.url());
    return request.method() === "POST" && isSupabaseSignOut(url);
  });

export async function mockSupabasePasswordSignIn(page: Page, email: string): Promise<void> {
  await page.route(isSupabasePasswordSignIn, async (route: Route) => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: CORS_HEADERS });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: CORS_HEADERS,
      body: JSON.stringify(buildSupabasePasswordSession(email)),
    });
  });
}

export async function mockSupabaseSignOut(page: Page): Promise<void> {
  await page.route(isSupabaseSignOut, async (route: Route) => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: CORS_HEADERS });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: CORS_HEADERS,
      body: JSON.stringify({}),
    });
  });
}

export async function mockRedSunPostLogin(page: Page, user: MeResponseDTO): Promise<void> {
  await page.route((url) => url.pathname.endsWith("/user/me"), async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(user),
    });
  });

  await page.route("**/authentication/session-established", async (route: Route) => {
    await route.fulfill({ status: 200 });
  });
}
