import { expect } from '@playwright/test';
import { ROUTE_PATHS } from '../../src/interface/constants/route-path.constants';
import { MeResponseDTO } from '../../src/interface/dtos/user/MeResponseDTO';
import { test } from './login.view.fixture';

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

test.describe('Login authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test('should login with email and password', async ({ page, loginViewE2e, testProfile }) => {
    await loginViewE2e.login(testProfile.email, testProfile.password);

    await expect(page).toHaveURL((url) => url.pathname === '/');
    await expect.poll(() => loginViewE2e.getStoredAuthToken()).not.toBeNull();
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

    await page.route('**/authentication/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'e2e-api-token',
          userId: outdatedUser.id,
          email: outdatedUser.email,
        }),
      });
    });
    await page.route('**/user/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(outdatedUser),
      });
    });
    await page.route('**/user/me/legal-acknowledgement', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(currentUser),
      });
    });

    await loginViewE2e.login(testProfile.email, testProfile.password);

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
