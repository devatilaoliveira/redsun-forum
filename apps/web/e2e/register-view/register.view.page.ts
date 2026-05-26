import { Locator, Page, Request } from '@playwright/test';

export class RegisterViewE2e {
  private page: Page;
  private registerSubmitBtn: Locator;
  private registerEmailInput: Locator;
  private registerPasswordInput: Locator;
  private registerConfirmPasswordInput: Locator;
  private registerAcceptedLegalInput: Locator;
  private registerTermsLink: Locator;
  private registerPrivacyLink: Locator;
  private registerCheckEmail: Locator;

  constructor(page: Page) {
    this.page = page;
    this.registerSubmitBtn = page.getByTestId('register-submit');
    this.registerEmailInput = page.getByTestId('register-email-input');
    this.registerPasswordInput = page.getByTestId('register-password-input');
    this.registerConfirmPasswordInput = page.getByTestId('register-confirm-password-input');
    this.registerAcceptedLegalInput = page.getByTestId('register-accepted-legal');
    this.registerTermsLink = page.getByTestId('register-terms-link');
    this.registerPrivacyLink = page.getByTestId('register-privacy-link');
    this.registerCheckEmail = page.getByTestId('register-check-email');
  }

  async navigateToRegisterView() {
    await this.page.goto('/register');
  }

  async register(email: string, password: string, confirmPassword: string = password) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.fillConfirmPassword(confirmPassword);
    await this.acceptLegal();
    await this.submit();
  }

  async fillEmail(email: string) {
    await this.registerEmailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.registerPasswordInput.fill(password);
  }

  async fillConfirmPassword(password: string) {
    await this.registerConfirmPasswordInput.fill(password);
  }

  async acceptLegal() {
    await this.registerAcceptedLegalInput.check();
  }

  async unacceptLegal() {
    await this.registerAcceptedLegalInput.uncheck();
  }

  async openTermsFromLegalConsent() {
    await this.registerTermsLink.click();
  }

  async openPrivacyFromLegalConsent() {
    await this.registerPrivacyLink.click();
  }

  async submit() {
    await this.registerSubmitBtn.click();
  }

  async waitForCheckEmailMessage() {
    await this.registerCheckEmail.waitFor({ state: 'visible' });
  }

  async isSubmitDisabled(): Promise<boolean> {
    return this.registerSubmitBtn.isDisabled();
  }

  async isAcceptedLegalChecked(): Promise<boolean> {
    return this.registerAcceptedLegalInput.isChecked();
  }

  async isAcceptedLegalRequiredMissing(): Promise<boolean> {
    return this.registerAcceptedLegalInput.evaluate((input: HTMLInputElement) => input.validity.valueMissing);
  }

  async waitForSupabaseSignUpRequest(): Promise<Request> {
    return this.page.waitForRequest((request) => {
      const url = new URL(request.url());
      return request.method() === 'POST' && url.pathname.endsWith('/auth/v1/signup');
    });
  }
}
