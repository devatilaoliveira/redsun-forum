import { Locator, Page } from '@playwright/test';
import { USER_STORE_KEY } from '../../src/interface/constants/store.constants';

export class LoginViewE2e {
  private page: Page;
  private loginSubmitBtn: Locator;
  private loginEmailInput: Locator;
  private loginPasswordInput: Locator;
  private loginEmailError: Locator;
  private loginPasswordError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginSubmitBtn = page.getByTestId('login-submit');
    this.loginEmailInput = page.getByTestId('login-email-input');
    this.loginPasswordInput = page.getByTestId('login-password-input');
    this.loginEmailError = page.getByTestId('login-email-input-error');
    this.loginPasswordError = page.getByTestId('login-password-input-error');
  }

  async navigateToLoginView() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  async fillEmail(email: string) {
    await this.loginEmailInput.fill(email);
  }

  async focusEmail() {
    await this.loginEmailInput.focus();
  }

  async blurEmail() {
    await this.loginEmailInput.blur();
  }

  async fillPassword(password: string) {
    await this.loginPasswordInput.fill(password);
  }

  async focusPassword() {
    await this.loginPasswordInput.focus();
  }

  async blurPassword() {
    await this.loginPasswordInput.blur();
  }

  async submit() {
    await this.loginSubmitBtn.click();
  }

  async isEmailInvalid(): Promise<boolean> {
    return this.loginEmailInput.evaluate((input: HTMLInputElement) => !input.checkValidity());
  }

  async isEmailTypeMismatch(): Promise<boolean> {
    return this.loginEmailInput.evaluate((input: HTMLInputElement) => input.validity.typeMismatch);
  }

  async isEmailRequiredMissing(): Promise<boolean> {
    return this.loginEmailInput.evaluate((input: HTMLInputElement) => input.validity.valueMissing);
  }

  async isEmailErrorVisible(): Promise<boolean> {
    return this.loginEmailError.isVisible();
  }

  async getEmailErrorText(): Promise<string> {
    return (await this.loginEmailError.textContent())?.trim() ?? '';
  }

  async isPasswordRequiredMissing(): Promise<boolean> {
    return this.loginPasswordInput.evaluate((input: HTMLInputElement) => input.validity.valueMissing);
  }

  async isPasswordErrorVisible(): Promise<boolean> {
    return this.loginPasswordError.isVisible();
  }

  async getPasswordErrorText(): Promise<string> {
    return (await this.loginPasswordError.textContent())?.trim() ?? '';
  }

  async isSubmitDisabled(): Promise<boolean> {
    return this.loginSubmitBtn.isDisabled();
  }

  async getStoredUser(): Promise<string | null> {
    return this.page.evaluate((key: string) => window.localStorage.getItem(key), USER_STORE_KEY);
  }
}
