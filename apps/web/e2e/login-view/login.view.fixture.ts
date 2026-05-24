import { test as base } from '../shared/fixtures/test-profile.fixture';
import { LoginViewE2e } from './login.view.page';
import { LegalAcceptanceViewE2e } from './legal-acceptance.view.page';

export const test = base.extend<{
  loginViewE2e: LoginViewE2e;
  legalAcceptanceViewE2e: LegalAcceptanceViewE2e;
}>({
  loginViewE2e: async ({ page }, use) => {
    const loginViewE2e = new LoginViewE2e(page);
    await loginViewE2e.navigateToLoginView();
    await use(loginViewE2e);
  },
  legalAcceptanceViewE2e: async ({ page }, use) => {
    await use(new LegalAcceptanceViewE2e(page));
  },
});
