import { expect, Page, Route } from '@playwright/test';
import { ROUTE_PATHS } from '../../src/interface/constants/route-path.constants';
import { MeResponseDTO } from '../../src/interface/dtos/user/MeResponseDTO';
import { test } from './login.view.fixture';

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
};

const buildUser = (email: string, currentLegalAcknowledgement: boolean): MeResponseDTO => ({
  id: 'e2e-login-user',
  username: 'e2e-login-user',
  email,
  imageURL: '',
  favoriteLanguage: [],
  favoriteRules: [],
  favoriteRole: [],
  contacts: [],
  legalAcknowledgement: {
    termsAccepted: currentLegalAcknowledgement,
    privacyAcknowledged: currentLegalAcknowledgement,
    current: currentLegalAcknowledgement,
    termsVersion: currentLegalAcknowledgement ? 'current-terms' : null,
    privacyVersion: currentLegalAcknowledgement ? 'current-privacy' : null,
    requiredTermsVersion: 'current-terms',
    requiredPrivacyVersion: 'current-privacy',
  },
});

const buildSupabasePasswordSession = (email: string) => {
  const now = new Date().toISOString();

  return {
    access_token: 'e2e-supabase-access-token',
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'e2e-supabase-refresh-token',
    user: {
      id: '00000000-0000-4000-8000-000000000001',
      aud: 'authenticated',
      role: 'authenticated',
      email,
      email_confirmed_at: now,
      confirmed_at: now,
      last_sign_in_at: now,
      app_metadata: {
        provider: 'email',
        providers: ['email'],
      },
      user_metadata: {},
      identities: [],
      created_at: now,
      updated_at: now,
    },
  };
};

const isSupabasePasswordSignIn = (url: URL): boolean =>
  url.pathname.endsWith('/auth/v1/token') && url.searchParams.get('grant_type') === 'password';

const waitForSupabasePasswordSignInRequest = (page: Page) =>
  page.waitForRequest((request) => {
    const url = new URL(request.url());
    return request.method() === 'POST' && isSupabasePasswordSignIn(url);
  });

async function mockSupabasePasswordSignIn(page: Page, email: string): Promise<void> {
  await page.route(isSupabasePasswordSignIn, async (route: Route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: CORS_HEADERS });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: CORS_HEADERS,
      body: JSON.stringify(buildSupabasePasswordSession(email)),
    });
  });
}

async function mockRedSunPostLogin(page: Page, user: MeResponseDTO): Promise<void> {
  await page.route((url) => url.pathname.endsWith('/user/me'), async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(user),
    });
  });

  await page.route('**/authentication/session-established', async (route: Route) => {
    await route.fulfill({ status: 200 });
  });
}

test.describe('Login authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test('should login with email and password', async ({ page, loginViewE2e, testProfile }) => {
    const currentUser = buildUser(testProfile.email, true);
    await mockSupabasePasswordSignIn(page, testProfile.email);
    await mockRedSunPostLogin(page, currentUser);

    const signInRequestPromise = waitForSupabasePasswordSignInRequest(page);
    const sessionEstablishedRequestPromise = page.waitForRequest('**/authentication/session-established');

    await loginViewE2e.login(testProfile.email, testProfile.password);

    const signInRequest = await signInRequestPromise;
    expect(signInRequest.postDataJSON()).toEqual(expect.objectContaining({
      email: testProfile.email,
      password: testProfile.password,
    }));

    const sessionEstablishedRequest = await sessionEstablishedRequestPromise;
    expect(sessionEstablishedRequest.headers()['authorization']).toBe('Bearer e2e-supabase-access-token');
    await expect(page).toHaveURL((url) => url.pathname === '/');
    await expect.poll(() => loginViewE2e.getStoredUser()).not.toBeNull();
  });

  test('should require current terms and privacy acknowledgement after login', async ({
    page,
    loginViewE2e,
    legalAcceptanceViewE2e,
    testProfile,
  }) => {
    const outdatedUser = buildUser(testProfile.email, false);
    const currentUser = buildUser(testProfile.email, true);
    await mockSupabasePasswordSignIn(page, testProfile.email);
    await mockRedSunPostLogin(page, outdatedUser);
    await page.route('**/user/me/legal-acknowledgement', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
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
      url.pathname === `/${ROUTE_PATHS.legalAcceptance}` && url.searchParams.get('returnUrl') === '/',
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
    await expect(page).toHaveURL((url) => url.pathname === '/');
  });
});
