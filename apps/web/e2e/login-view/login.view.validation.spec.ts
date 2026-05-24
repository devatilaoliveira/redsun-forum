import { expect } from '@playwright/test';
import { test } from './login.view.fixture';

const USER_PASSWORD = '123456789';

test.describe('Login validation', () => {
  test.describe.configure({ mode: 'parallel' });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test('should block submit for invalid email format', async ({ page, loginViewE2e }) => {
    await loginViewE2e.fillEmail('useremailwrongformat');
    await loginViewE2e.fillPassword(USER_PASSWORD);

    await expect.poll(() => loginViewE2e.isEmailInvalid()).toBe(true);
    await expect.poll(() => loginViewE2e.isEmailTypeMismatch()).toBe(true);
    await expect.poll(() => loginViewE2e.isSubmitDisabled()).toBe(true);
    await expect(page).toHaveURL((url) => url.pathname === '/login');
    await expect.poll(() => loginViewE2e.getStoredAuthToken()).toBeNull();
    await expect.poll(() => loginViewE2e.getStoredUser()).toBeNull();
  });

  test('should keep submit disabled until the form is valid', async ({ loginViewE2e }) => {
    await expect.poll(() => loginViewE2e.isSubmitDisabled()).toBe(true);

    await loginViewE2e.fillPassword(USER_PASSWORD);
    await expect.poll(() => loginViewE2e.isSubmitDisabled()).toBe(true);

    await loginViewE2e.navigateToLoginView();
    await expect.poll(() => loginViewE2e.isSubmitDisabled()).toBe(true);

    await loginViewE2e.fillEmail('not.registered@example');
    await loginViewE2e.fillPassword(USER_PASSWORD);
    await expect.poll(() => loginViewE2e.isSubmitDisabled()).toBe(true);

    await loginViewE2e.navigateToLoginView();
    await loginViewE2e.fillEmail('not.registered@example.com');
    await expect.poll(() => loginViewE2e.isSubmitDisabled()).toBe(true);

    await loginViewE2e.fillPassword(USER_PASSWORD);
    await expect.poll(() => loginViewE2e.isSubmitDisabled()).toBe(false);
  });

  test('should show email required error after blur', async ({ loginViewE2e }) => {
    await loginViewE2e.focusEmail();
    await loginViewE2e.blurEmail();

    await expect.poll(() => loginViewE2e.isEmailRequiredMissing()).toBe(true);
    await expect.poll(() => loginViewE2e.isEmailErrorVisible()).toBe(true);
    await expect.poll(() => loginViewE2e.getEmailErrorText()).not.toEqual('');
  });

  test('should show password required error after blur when email is filled', async ({ loginViewE2e }) => {
    await loginViewE2e.fillEmail('not.registered@example.com');
    await loginViewE2e.focusPassword();
    await loginViewE2e.blurPassword();

    await expect.poll(() => loginViewE2e.isPasswordRequiredMissing()).toBe(true);
    await expect.poll(() => loginViewE2e.isPasswordErrorVisible()).toBe(true);
    await expect.poll(() => loginViewE2e.getPasswordErrorText()).not.toEqual('');
  });
});
