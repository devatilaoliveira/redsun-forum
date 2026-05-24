import { Locator, Page, Request } from '@playwright/test';

export class LegalAcceptanceViewE2e {
  private acceptedTermsInput: Locator;
  private acknowledgedPrivacyInput: Locator;
  private submitBtn: Locator;

  constructor(private readonly page: Page) {
    this.acceptedTermsInput = page.getByTestId('legal-acceptance-terms');
    this.acknowledgedPrivacyInput = page.getByTestId('legal-acceptance-privacy');
    this.submitBtn = page.getByTestId('legal-acceptance-submit');
  }

  async acceptTerms() {
    await this.acceptedTermsInput.check();
  }

  async acknowledgePrivacy() {
    await this.acknowledgedPrivacyInput.check();
  }

  async submit() {
    await this.submitBtn.click();
  }

  async isSubmitDisabled(): Promise<boolean> {
    return this.submitBtn.isDisabled();
  }

  async isTermsAccepted(): Promise<boolean> {
    return this.acceptedTermsInput.isChecked();
  }

  async isPrivacyAcknowledged(): Promise<boolean> {
    return this.acknowledgedPrivacyInput.isChecked();
  }

  async waitForLegalAcknowledgementRequest(): Promise<Request> {
    return this.page.waitForRequest((request) => {
      const url = new URL(request.url());
      return request.method() === 'POST' && url.pathname.endsWith('/user/me/legal-acknowledgement');
    });
  }
}
